import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export type WorkflowStepState =
  | 'PRECONDITION_CHECK'
  | 'EXECUTE'
  | 'VERIFY'
  | 'EVALUATE_POLICY'
  | 'COMPLETE'
  | 'RETRY'
  | 'COMPENSATE'
  | 'ESCALATE';

export interface WorkflowStep {
  id: string;
  workflowId: string;
  stepName: string;
  state: WorkflowStepState;
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
  createdAt: string;
  updatedAt: string;
}

export class WorkflowEngine {
  constructor(private db: Database.Database) {
    this.initDatabase();
  }

  private initDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflow_steps (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        step_name TEXT NOT NULL,
        state TEXT NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        max_retries INTEGER NOT NULL DEFAULT 3,
        timeout_ms INTEGER NOT NULL DEFAULT 30000,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  public createStep(workflowId: string, stepName: string, maxRetries = 3, timeoutMs = 30000): WorkflowStep {
    const step: WorkflowStep = {
      id: uuidv4(),
      workflowId,
      stepName,
      state: 'PRECONDITION_CHECK',
      retryCount: 0,
      maxRetries,
      timeoutMs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.prepare(`
      INSERT INTO workflow_steps (id, workflow_id, step_name, state, retry_count, max_retries, timeout_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(step.id, step.workflowId, step.stepName, step.state, step.retryCount, step.maxRetries, step.timeoutMs);

    return step;
  }

  public transition(stepId: string, newState: WorkflowStepState): WorkflowStep {
    const step = this.getStep(stepId);
    if (!step) {
      throw new Error(`Workflow step not found: ${stepId}`);
    }

    let retryCount = step.retryCount;
    if (newState === 'RETRY') {
      retryCount++;
      if (retryCount > step.maxRetries) {
        newState = 'ESCALATE';
      }
    }

    this.db.prepare(`
      UPDATE workflow_steps
      SET state = ?, retry_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newState, retryCount, stepId);

    return { ...step, state: newState, retryCount };
  }

  public getStep(stepId: string): WorkflowStep | null {
    const row = this.db.prepare(`
      SELECT id, workflow_id as workflowId, step_name as stepName, state,
             retry_count as retryCount, max_retries as maxRetries, timeout_ms as timeoutMs,
             created_at as createdAt, updated_at as updatedAt
      FROM workflow_steps WHERE id = ?
    `).get(stepId) as any;

    return row || null;
  }
}
