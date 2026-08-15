import Database from 'better-sqlite3';

export interface Command {
  type: string;
  idempotencyKey?: string;
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

    return await handler(command, this.db);
  }
}
