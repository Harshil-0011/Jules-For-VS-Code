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

  constructor(private db: Database.Database) {}

  public register(type: string, handler: CommandHandler): void {
    this.handlers.set(type, handler);
  }

  public async dispatch(command: Command): Promise<any> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command: ${command.type}`);
    }

    if (command.idempotencyKey) {
      const existing = this.db.prepare(
        'SELECT * FROM audit_logs WHERE metadata_json LIKE ?'
      ).get(`%"idempotencyKey":"${command.idempotencyKey}"%`);

      if (existing) {
        return { status: 'IDEMPOTENT_SKIPPED', idempotencyKey: command.idempotencyKey };
      }
    }

    const result = await handler(command, this.db);

    if (command.idempotencyKey) {
      this.db.prepare(`
        INSERT INTO audit_logs (id, tenant_id, actor, action, resource, decision, reason, metadata_json)
        VALUES (?, ?, 'SYSTEM', 'COMMAND_DISPATCH', ?, 'ALLOWED', 'Command executed', ?)
      `).run(
        uuidv4(),
        command.tenantId || 'default-tenant',
        command.type,
        JSON.stringify({ idempotencyKey: command.idempotencyKey, payload: command.payload })
      );
    }

    return result;
  }
}
