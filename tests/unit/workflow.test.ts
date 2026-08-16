import { DatabaseService } from '../../server/persistence/database';
import { WorkflowEngine } from '../../server/workflows/workflow_engine';
import { DAGScheduler } from '../../server/scheduler/dag';
import { Task } from '../../server/tasks/models';

describe('WorkflowEngine & Failure Propagation', () => {
  let dbService: DatabaseService;
  let workflowEngine: WorkflowEngine;

  beforeEach(() => {
    dbService = new DatabaseService(':memory:');
    workflowEngine = new WorkflowEngine(dbService.getDb());
  });

  afterEach(() => {
    dbService.close();
  });

  it('should transition step states and escalate after max retries', () => {
    const step = workflowEngine.createStep('wf-1', 'BuildStep', 2, 5000);
    expect(step.state).toBe('PRECONDITION_CHECK');

    let updated = workflowEngine.transition(step.id, 'EXECUTE');
    expect(updated.state).toBe('EXECUTE');

    updated = workflowEngine.transition(step.id, 'RETRY');
    expect(updated.state).toBe('RETRY');
    expect(updated.retryCount).toBe(1);

    updated = workflowEngine.transition(step.id, 'RETRY');
    expect(updated.state).toBe('RETRY');
    expect(updated.retryCount).toBe(2);

    updated = workflowEngine.transition(step.id, 'RETRY');
    expect(updated.state).toBe('ESCALATE');
    expect(updated.retryCount).toBe(3);
  });

  it('should propagate failure to dependent tasks in DAG', () => {
    const dummyTask = (id: string, dependencies: string[], status: any = 'CREATED'): Task => ({
      id,
      tenantId: 't1',
      projectId: 'p1',
      title: id,
      description: '',
      status,
      riskLevel: 'LOW',
      budget: { maxRuntimeSec: 100, maxToolCalls: 10, maxCostUsd: 1, maxRetries: 1 },
      dependencies,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const t1 = dummyTask('task-1', [], 'FAILED');
    const t2 = dummyTask('task-2', ['task-1'], 'CREATED');
    const t3 = dummyTask('task-3', ['task-2'], 'CREATED');

    const result = DAGScheduler.propagateFailures([t1, t2, t3]);
    const t2Result = result.find((t) => t.id === 'task-2');
    const t3Result = result.find((t) => t.id === 'task-3');

    expect(t2Result?.status).toBe('CANCELLED');
    expect(t3Result?.status).toBe('CANCELLED');
  });
});
