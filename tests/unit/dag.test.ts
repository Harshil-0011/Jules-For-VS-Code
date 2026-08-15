import { DAGScheduler } from '../../server/scheduler/dag';
import { Task } from '../../server/tasks/models';

describe('DAGScheduler', () => {
  const dummyTask = (id: string, dependencies: string[]): Task => ({
    id,
    tenantId: 't1',
    projectId: 'p1',
    title: id,
    description: '',
    status: 'CREATED',
    riskLevel: 'LOW',
    budget: { maxRuntimeSec: 100, maxToolCalls: 10, maxCostUsd: 1, maxRetries: 1 },
    dependencies,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('should detect no cycles in valid DAG', () => {
    const tasks = [
      dummyTask('task-1', []),
      dummyTask('task-2', ['task-1']),
      dummyTask('task-3', ['task-2']),
    ];

    expect(DAGScheduler.detectCycle(tasks)).toBe(false);
  });

  it('should detect cycle in cyclic DAG', () => {
    const tasks = [
      dummyTask('task-1', ['task-3']),
      dummyTask('task-2', ['task-1']),
      dummyTask('task-3', ['task-2']),
    ];

    expect(DAGScheduler.detectCycle(tasks)).toBe(true);
  });

  it('should return tasks ready for execution', () => {
    const t1 = dummyTask('task-1', []);
    t1.status = 'COMPLETED';

    const t2 = dummyTask('task-2', ['task-1']);
    const t3 = dummyTask('task-3', ['task-2']);

    const ready = DAGScheduler.getReadyTasks([t1, t2, t3]);
    expect(ready.map((r) => r.id)).toEqual(['task-2']);
  });
});
