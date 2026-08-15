import { Task } from '../tasks/models';

export class DAGScheduler {
  public static detectCycle(tasks: Task[]): boolean {
    const taskMap = new Map<string, Task>(tasks.map((t) => [t.id, t]));
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (taskId: string): boolean => {
      visited.add(taskId);
      recursionStack.add(taskId);

      const task = taskMap.get(taskId);
      if (task) {
        for (const depId of task.dependencies) {
          if (!visited.has(depId)) {
            if (dfs(depId)) return true;
          } else if (recursionStack.has(depId)) {
            return true;
          }
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        if (dfs(task.id)) return true;
      }
    }

    return false;
  }

  public static getReadyTasks(tasks: Task[]): Task[] {
    const taskMap = new Map<string, Task>(tasks.map((t) => [t.id, t]));

    return tasks.filter((task) => {
      if (task.status !== 'CREATED' && task.status !== 'PENDING_DEPENDENCIES') {
        return false;
      }

      const allDepsSatisfied = task.dependencies.every((depId) => {
        const dep = taskMap.get(depId);
        return dep && dep.status === 'COMPLETED';
      });

      return allDepsSatisfied;
    });
  }

  public static propagateFailures(tasks: Task[]): Task[] {
    const taskMap = new Map<string, Task>(tasks.map((t) => [t.id, t]));
    let updated = false;

    do {
      updated = false;
      for (const task of tasks) {
        if (task.status === 'CREATED' || task.status === 'PENDING_DEPENDENCIES' || task.status === 'READY') {
          const hasFailedDep = task.dependencies.some((depId) => {
            const dep = taskMap.get(depId);
            return dep && (dep.status === 'FAILED' || dep.status === 'CANCELLED' || dep.status === 'BLOCKED');
          });

          if (hasFailedDep) {
            task.status = 'CANCELLED';
            updated = true;
          }
        }
      }
    } while (updated);

    return Array.from(taskMap.values());
  }
}
