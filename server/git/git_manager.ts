import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitWorkspace {
  agentId: string;
  taskId: string;
  branchName: string;
  baseCommit: string;
  currentCommit: string;
}

export class GitManager {
  private workspaces = new Map<string, GitWorkspace>();

  public async getHeadCommit(): Promise<string> {
    try {
      const { stdout } = await execAsync('git rev-parse HEAD');
      return stdout.trim();
    } catch {
      return 'mock-head-commit-sha';
    }
  }

  public async createIsolatedWorkspace(agentId: string, taskId: string): Promise<GitWorkspace> {
    const baseCommit = await this.getHeadCommit();
    const branchName = `jules/task-${taskId.slice(0, 8)}-agent-${agentId.slice(0, 8)}`;

    const workspace: GitWorkspace = {
      agentId,
      taskId,
      branchName,
      baseCommit,
      currentCommit: baseCommit,
    };

    this.workspaces.set(taskId, workspace);
    return workspace;
  }

  public async validateBaseCommit(taskId: string): Promise<{ valid: boolean; currentHead: string; expectedBase: string }> {
    const workspace = this.workspaces.get(taskId);
    if (!workspace) {
      throw new Error(`Workspace not found for task ${taskId}`);
    }

    const currentHead = await this.getHeadCommit();
    const valid = workspace.baseCommit === currentHead;

    return {
      valid,
      currentHead,
      expectedBase: workspace.baseCommit,
    };
  }
}
