import Database from 'better-sqlite3';

export interface MemoryItem {
  id: string;
  scope: 'GLOBAL' | 'PROJECT' | 'TASK';
  scopeId: string;
  key: string;
  value: string;
  provenance: {
    sourceTaskId?: string;
    agentId?: string;
    timestamp: string;
  };
}

export class ContextEngine {
  constructor(private db: Database.Database) {
    this.initDatabase();
  }

  private initDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS context_memory (
        id TEXT PRIMARY KEY,
        scope TEXT NOT NULL,
        scope_id TEXT NOT NULL,
        memory_key TEXT NOT NULL,
        memory_value TEXT NOT NULL,
        provenance_json TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  public store(item: MemoryItem): void {
    this.db.prepare(`
      INSERT OR REPLACE INTO context_memory (id, scope, scope_id, memory_key, memory_value, provenance_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      item.id,
      item.scope,
      item.scopeId,
      item.key,
      item.value,
      JSON.stringify(item.provenance)
    );
  }

  public query(scope: 'GLOBAL' | 'PROJECT' | 'TASK', scopeId: string): MemoryItem[] {
    const rows = this.db.prepare(`
      SELECT id, scope, scope_id as scopeId, memory_key as key, memory_value as value, provenance_json as provenanceJson
      FROM context_memory WHERE scope = ? AND scope_id = ?
    `).all(scope, scopeId) as any[];

    return rows.map((r) => ({
      id: r.id,
      scope: r.scope,
      scopeId: r.scopeId,
      key: r.key,
      value: r.value,
      provenance: JSON.parse(r.provenanceJson),
    }));
  }
}
