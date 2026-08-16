import { PolicyEngine } from '../policies/policy_engine';
import { BudgetManager } from '../budgets/budget_manager';
import { TaskBudget } from '../tasks/models';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ToolCallRequest {
  taskId: string;
  toolName: string;
  args?: Record<string, any>;
  budget: TaskBudget;
}

export interface ToolCallResult {
  success: boolean;
  output: string;
  error?: string;
  redacted: boolean;
}

export class ExecutionBroker {
  private emergencyStopped = false;

  constructor(
    private policyEngine: PolicyEngine,
    private budgetManager: BudgetManager
  ) {}

  public triggerEmergencyStop(): void {
    this.emergencyStopped = true;
  }

  public resetEmergencyStop(): void {
    this.emergencyStopped = false;
  }

  public isEmergencyStopped(): boolean {
    return this.emergencyStopped;
  }

  public async executeTool(request: ToolCallRequest): Promise<ToolCallResult> {
    if (this.emergencyStopped) {
      return {
        success: false,
        output: '',
        error: 'EMERGENCY_STOP: Tool execution blocked by global emergency stop',
        redacted: false,
      };
    }

    const budgetCheck = this.budgetManager.checkBudget(request.taskId, request.budget);
    if (!budgetCheck.allowed) {
      return {
        success: false,
        output: '',
        error: `BUDGET_EXCEEDED: ${budgetCheck.reason}`,
        redacted: false,
      };
    }

    const args = request.args || {};

    const policyCheck = this.policyEngine.evaluate(request.toolName, 'execute', args);
    if (policyCheck.decision === 'DENY') {
      return {
        success: false,
        output: '',
        error: `POLICY_DENIED: ${policyCheck.reason}`,
        redacted: false,
      };
    }

    if (policyCheck.decision === 'REQUIRES_APPROVAL') {
      return {
        success: false,
        output: '',
        error: `APPROVAL_REQUIRED: ${policyCheck.reason}`,
        redacted: false,
      };
    }

    try {
      this.budgetManager.recordUsage(request.taskId, 1, 1, 0.01);

      if (request.toolName === 'shell') {
        const cmd = args.command || '';
        if (cmd.includes('sudo') || cmd.includes('/etc/') || cmd.includes('rm -rf /')) {
          return {
            success: false,
            output: '',
            error: 'SANDBOX_VIOLATION: Command prohibited by sandbox isolation policy',
            redacted: false,
          };
        }

        const { stdout, stderr } = await execAsync(cmd, { timeout: 10000 });
        const rawOutput = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
        const { text: cleanOutput, redacted } = this.redactSecrets(rawOutput);

        return {
          success: true,
          output: cleanOutput,
          redacted,
        };
      }

      return {
        success: true,
        output: `Executed tool ${request.toolName} with args ${JSON.stringify(args)}`,
        redacted: false,
      };
    } catch (err: any) {
      return {
        success: false,
        output: '',
        error: err.message,
        redacted: false,
      };
    }
  }

  public redactSecrets(input: string): { text: string; redacted: boolean } {
    let redacted = false;
    let text = input;

    const secretPatterns = [
      /sk-[a-zA-Z0-9]{32,}/g,
      /ghp_[a-zA-Z0-9]{36}/g,
      /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    ];

    for (const pattern of secretPatterns) {
      if (pattern.test(text)) {
        redacted = true;
        text = text.replace(pattern, '[REDACTED_SECRET]');
      }
    }

    return { text, redacted };
  }
}
