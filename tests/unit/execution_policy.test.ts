import { PolicyEngine } from '../../server/policies/policy_engine';
import { BudgetManager } from '../../server/budgets/budget_manager';
import { ExecutionBroker } from '../../server/execution/execution_broker';

describe('ExecutionBroker & PolicyEngine', () => {
  let policyEngine: PolicyEngine;
  let budgetManager: BudgetManager;
  let broker: ExecutionBroker;

  beforeEach(() => {
    policyEngine = new PolicyEngine();
    budgetManager = new BudgetManager();
    broker = new ExecutionBroker(policyEngine, budgetManager);
  });

  it('should block execution when emergency stop is activated', async () => {
    broker.triggerEmergencyStop();

    const res = await broker.executeTool({
      taskId: 't1',
      toolName: 'echo',
      args: { msg: 'hello' },
      budget: { maxRuntimeSec: 100, maxToolCalls: 10, maxCostUsd: 1, maxRetries: 1 },
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('EMERGENCY_STOP');
  });

  it('should redact secrets from output', () => {
    const raw = 'Connected with token ghp_123456789012345678901234567890123456 and sk-abcdefghijklmnopqrstuvwxyz123456';
    const { text, redacted } = broker.redactSecrets(raw);

    expect(redacted).toBe(true);
    expect(text).not.toContain('ghp_123456789012345678901234567890123456');
    expect(text).toContain('[REDACTED_SECRET]');
  });

  it('should enforce budget limits', async () => {
    const budget = { maxRuntimeSec: 100, maxToolCalls: 1, maxCostUsd: 1, maxRetries: 1 };

    await broker.executeTool({ taskId: 't1', toolName: 'echo', args: {}, budget });

    const res = await broker.executeTool({ taskId: 't1', toolName: 'echo', args: {}, budget });

    expect(res.success).toBe(false);
    expect(res.error).toContain('BUDGET_EXCEEDED');
  });
});
