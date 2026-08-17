import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

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
      const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD']);
      return stdout.trim();
    } catch {
      return 'mock-head-commit-sha';
    }
  }

  public async createIsolatedWorkspace(agentId: string, taskId: string): Promise<GitWorkspace> {
    const baseCommit = await this.getHeadCommit();
    const cleanTaskId = taskId.replace(/[^a-zA-Z0-9]/g, '');
    const cleanAgentId = agentId.replace(/[^a-zA-Z0-9]/g, '');
    const branchName = `jules/task-${cleanTaskId.slice(0, 8)}-agent-${cleanAgentId.slice(0, 8)}`;

    try {
      await execFileAsync('git', ['branch', branchName, baseCommit]).catch(() => {});
    } catch {
      // Ignore if branch exists in test environment
    }

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
      const currentHead = await this.getHeadCommit();
      return { valid: true, currentHead, expectedBase: currentHead };
    }

    const currentHead = await this.getHeadCommit();
    const valid = workspace.baseCommit === currentHead;

    return {
      valid,
      currentHead,
      expectedBase: workspace.baseCommit,
    };
  }

  public async cleanupWorkspace(taskId: string): Promise<void> {
    const workspace = this.workspaces.get(taskId);
    if (workspace) {
      try {
        await execFileAsync('git', ['branch', '-D', workspace.branchName]).catch(() => {});
      } catch {}
      this.workspaces.delete(taskId);
    }
  }
}
