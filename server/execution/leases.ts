import Database from 'better-sqlite3';

export class LeaseManager {
  constructor(private db: Database.Database) {}

  public acquireLease(resourceId: string, ownerId: string, ttlMs: number): number | null {
    const expiresAt = new Date(Date.now() + ttlMs).toISOString();

    const existing = this.db.prepare('SELECT * FROM leases WHERE resource_id = ?').get(resourceId) as any;

    if (!existing) {
      const fencingToken = 1;
      this.db.prepare(`
        INSERT INTO leases (resource_id, owner_id, fencing_token, expires_at)
        VALUES (?, ?, ?, ?)
      `).run(resourceId, ownerId, fencingToken, expiresAt);
      return fencingToken;
    }

    const isExpired = new Date(existing.expires_at).getTime() < Date.now();
    if (existing.owner_id === ownerId || isExpired) {
      const newFencingToken = existing.fencing_token + 1;
      this.db.prepare(`
        UPDATE leases SET owner_id = ?, fencing_token = ?, expires_at = ? WHERE resource_id = ?
      `).run(ownerId, newFencingToken, expiresAt, resourceId);
      return newFencingToken;
    }

    return null;
  }

  public validateFenceToken(resourceId: string, ownerId: string, token: number): boolean {
    const lease = this.db.prepare('SELECT * FROM leases WHERE resource_id = ?').get(resourceId) as any;
    if (!lease) return false;

    const notExpired = new Date(lease.expires_at).getTime() >= Date.now();
    return lease.owner_id === ownerId && lease.fencing_token === token && notExpired;
  }

  public reclaimExpiredLeases(): number {
    const now = new Date().toISOString();
    const result = this.db.prepare(`
      DELETE FROM leases WHERE expires_at < ?
    `).run(now);
    return result.changes;
  }
}
