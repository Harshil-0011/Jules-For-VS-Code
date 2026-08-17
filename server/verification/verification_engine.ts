import { Evidence } from '../tasks/models';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface VerificationRequest {
  taskId: string;
  runBuild?: boolean;
  runTests?: boolean;
  runLint?: boolean;
}

export class VerificationEngine {
  constructor(private db: Database.Database) {}

  public async verifyClaims(request: VerificationRequest): Promise<Evidence[]> {
    const results: Evidence[] = [];

    if (request.runBuild) {
      try {
        const { stdout } = await execFileAsync('npm', ['run', 'build'], { timeout: 15000 });
        results.push({
          id: uuidv4(),
          taskId: request.taskId,
          claim: 'Build succeeds cleanly',
          status: 'VERIFIED',
          details: { output: stdout },
          createdAt: new Date().toISOString(),
        });
      } catch (err: any) {
        results.push({
          id: uuidv4(),
          taskId: request.taskId,
          claim: 'Build succeeds cleanly',
          status: 'REJECTED',
          details: { error: err.message },
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (request.runTests) {
      try {
        const { stdout } = await execFileAsync('npm', ['test'], { timeout: 15000 });
        results.push({
          id: uuidv4(),
          taskId: request.taskId,
          claim: 'Unit tests pass',
          status: 'VERIFIED',
          details: { output: stdout },
          createdAt: new Date().toISOString(),
        });
      } catch (err: any) {
        results.push({
          id: uuidv4(),
          taskId: request.taskId,
          claim: 'Unit tests pass',
          status: 'REJECTED',
          details: { error: err.message },
          createdAt: new Date().toISOString(),
        });
      }
    }

    for (const item of results) {
      this.db.prepare(`
        INSERT INTO evidence (id, task_id, claim, status, details_json)
        VALUES (?, ?, ?, ?, ?)
      `).run(item.id, item.taskId, item.claim, item.status, JSON.stringify(item.details));
    }

    return results;
  }
}
