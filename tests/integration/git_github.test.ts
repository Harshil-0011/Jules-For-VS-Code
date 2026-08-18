import { GitManager } from '../../server/git/git_manager';
import { GitHubProvider } from '../../server/github/github_provider';

describe('GitManager & GitHubProvider (Phase 5)', () => {
  let gitManager: GitManager;
  let githubProvider: GitHubProvider;

  beforeEach(() => {
    gitManager = new GitManager();
    githubProvider = new GitHubProvider('mock-gh-token');
  });

  it('should create isolated Git branch and validate base commit', async () => {
    const taskId = 'task-git-123';
    const workspace = await gitManager.createIsolatedWorkspace('agent-1', taskId);

    expect(workspace.branchName).toContain('jules/task-taskgit1');
    expect(workspace.baseCommit).toBeDefined();

    const validation = await gitManager.validateBaseCommit(taskId);
    expect(validation.valid).toBe(true);

    await gitManager.cleanupWorkspace(taskId);
  });

  it('should create and merge Pull Requests via GitHubProvider', async () => {
    const pr = await githubProvider.createPullRequest('Add feature X', 'jules/task-feature-x', 'main');

    expect(pr.number).toBeGreaterThan(100);
    expect(pr.status).toBe('OPEN');

    const merged = await githubProvider.mergePullRequest(pr.number);
    expect(merged).toBe(true);

    const updated = await githubProvider.getPullRequest(pr.number);
    expect(updated.status).toBe('MERGED');
  });
});
