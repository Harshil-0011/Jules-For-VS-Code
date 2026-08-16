import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface Event {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: any;
  timestamp: string;
}

export class OutboxService {
  constructor(private db: Database.Database) {}

  public publishInTransaction(
    aggregateType: string,
    aggregateId: string,
    eventType: string,
    payload: any
  ): Event {
    const event: Event = {
      id: uuidv4(),
      aggregateType,
      aggregateId,
      eventType,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.db.prepare(`
      INSERT INTO outbox (id, aggregate_type, aggregate_id, event_type, payload_json, status)
      VALUES (?, ?, ?, ?, ?, 'PENDING')
    `).run(event.id, event.aggregateType, event.aggregateId, event.eventType, JSON.stringify(event.payload));

    return event;
  }

  public async processOutbox(handler: (event: Event) => Promise<void>): Promise<number> {
    const pending = this.db.prepare(`
      SELECT id, aggregate_type as aggregateType, aggregate_id as aggregateId,
             event_type as eventType, payload_json as payloadJson, created_at as timestamp
      FROM outbox WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT 50
    `).all() as any[];

    let processedCount = 0;
    for (const row of pending) {
      const event: Event = {
        id: row.id,
        aggregateType: row.aggregateType,
        aggregateId: row.aggregateId,
        eventType: row.eventType,
        payload: JSON.parse(row.payloadJson),
        timestamp: row.timestamp,
      };

      try {
        await handler(event);
        this.db.prepare(`UPDATE outbox SET status = 'PROCESSED', processed_at = CURRENT_TIMESTAMP WHERE id = ?`).run(event.id);
        processedCount++;
      } catch (err) {
        this.db.prepare(`UPDATE outbox SET status = 'FAILED' WHERE id = ?`).run(event.id);
      }
    }

    return processedCount;
  }
}

export class InboxService {
  constructor(private db: Database.Database) {}

  public isAlreadyProcessed(eventId: string, consumerName: string): boolean {
    const row = this.db.prepare(`
      SELECT 1 FROM inbox WHERE event_id = ? AND consumer = ?
    `).get(eventId, consumerName);
    return !!row;
  }

  public markProcessed(eventId: string, consumerName: string): void {
    this.db.prepare(`
      INSERT INTO inbox (event_id, consumer) VALUES (?, ?)
    `).run(eventId, consumerName);
  }
}
