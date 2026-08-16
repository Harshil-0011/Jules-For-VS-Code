import { TaskBudget } from '../tasks/models';

export class BudgetManager {
  private usage = new Map<string, { toolCalls: number; runtimeSec: number; costUsd: number }>();

  public checkBudget(taskId: string, budget: TaskBudget): { allowed: boolean; reason?: string } {
    const current = this.usage.get(taskId) || { toolCalls: 0, runtimeSec: 0, costUsd: 0 };

    if (current.toolCalls >= budget.maxToolCalls) {
      return { allowed: false, reason: `Max tool calls exceeded (${budget.maxToolCalls})` };
    }
    if (current.runtimeSec >= budget.maxRuntimeSec) {
      return { allowed: false, reason: `Max runtime exceeded (${budget.maxRuntimeSec}s)` };
    }
    if (current.costUsd >= budget.maxCostUsd) {
      return { allowed: false, reason: `Max cost exceeded ($${budget.maxCostUsd})` };
    }

    return { allowed: true };
  }

  public recordUsage(taskId: string, toolCalls: number, runtimeSec: number, costUsd: number): void {
    const current = this.usage.get(taskId) || { toolCalls: 0, runtimeSec: 0, costUsd: 0 };
    this.usage.set(taskId, {
      toolCalls: current.toolCalls + toolCalls,
      runtimeSec: current.runtimeSec + runtimeSec,
      costUsd: current.costUsd + costUsd,
    });
  }
}
