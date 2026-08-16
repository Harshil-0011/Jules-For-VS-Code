import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface Command {
  type: string;
  idempotencyKey?: string;
  tenantId?: string;
  payload: any;
}

export type CommandHandler = (command: Command, db: Database.Database) => Promise<any>;

export class CommandBus {
  private handlers = new Map<string, CommandHandler>();

  constructor(private db: Database.Database) {
    this.initDatabase();
  }

  private initDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS idempotency_keys (
        key TEXT PRIMARY KEY,
        command_type TEXT NOT NULL,
        result_json TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  public register(type: string, handler: CommandHandler): void {
    this.handlers.set(type, handler);
  }

  public async dispatch(command: Command): Promise<any> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command: ${command.type}`);
    }

    if (command.idempotencyKey) {
      const existing = this.db.prepare('SELECT result_json FROM idempotency_keys WHERE key = ?').get(command.idempotencyKey) as any;
      if (existing) {
        return JSON.parse(existing.result_json);
      }
    }

    const result = await handler(command, this.db);

    if (command.idempotencyKey) {
      this.db.prepare(`
        INSERT INTO idempotency_keys (key, command_type, result_json)
        VALUES (?, ?, ?)
      `).run(command.idempotencyKey, command.type, JSON.stringify(result));
    }

    return result;
  }
}
