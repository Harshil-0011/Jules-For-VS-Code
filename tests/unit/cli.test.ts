import * as fs from 'fs';
import * as path from 'path';
import { runAgentLoop, inspectRepository, checkPolicy, SessionManager, main } from '../../cli/index';

describe('Product 3 — Jules Code CLI (Phase 4 Canonical Architecture)', () => {
  const tmpRepo = path.join(process.cwd(), '.tmp_cli_test_repo');

  beforeAll(() => {
    if (!fs.existsSync(tmpRepo)) {
      fs.mkdirSync(tmpRepo, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tmpRepo)) {
      fs.rmSync(tmpRepo, { recursive: true, force: true });
    }
  });

  it('should inspect repository state accurately', () => {
    const inspection = inspectRepository(tmpRepo);
    expect(inspection.rootPath).toBe(tmpRepo);
    expect(inspection.projectName).toBe('.tmp_cli_test_repo');
    expect(inspection.userChangesDetected).toBe(false);
  });

  it('should enforce permission modes during policy checks', () => {
    const readOnlyWrite = checkPolicy('write', 'READ_ONLY');
    expect(readOnlyWrite.allowed).toBe(false);
    expect(readOnlyWrite.reason).toContain('READ_ONLY mode forbids mutations');

    const readOnlyRead = checkPolicy('read', 'READ_ONLY');
    expect(readOnlyRead.allowed).toBe(true);

    const askWrite = checkPolicy('write', 'ASK');
    expect(askWrite.allowed).toBe(false);
    expect(askWrite.reason).toContain('requires user confirmation');

    const autoWrite = checkPolicy('write', 'AUTO');
    expect(autoWrite.allowed).toBe(true);
  });

  it('should execute full agent loop in AUTO permission mode', async () => {
    const result = await runAgentLoop('Fix failing test in auth module', {
      mode: 'single_task',
      permissionMode: 'AUTO',
      repoPath: tmpRepo,
    });

    expect(result.status).toBe('PASSED');
    expect(result.changesApplied).toBe(true);
    expect(result.verificationPassed).toBe(true);
    expect(result.activities.length).toBeGreaterThan(5);
  });

  it('should block agent loop when policy forbids action in READ_ONLY mode', async () => {
    const result = await runAgentLoop('Attempt unauthorized write', {
      mode: 'single_task',
      permissionMode: 'READ_ONLY',
      repoPath: tmpRepo,
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.changesApplied).toBe(false);
  });

  it('should store and resume CLI sessions', () => {
    const sessionMgr = new SessionManager(tmpRepo);
    const session = {
      sessionId: 'test-session-cli-1',
      task: 'Refactor logger',
      mode: 'single_task' as const,
      permissionMode: 'AUTO' as const,
      repository: 'test-repo',
      branch: 'main',
      status: 'COMPLETED' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: ['Task created', 'Completed'],
    };

    sessionMgr.saveSession(session);
    const sessions = sessionMgr.listSessions();
    expect(sessions.length).toBeGreaterThan(0);

    const fetched = sessionMgr.getSession('test-session-cli-1');
    expect(fetched?.task).toBe('Refactor logger');
  });

  it('should execute main CLI commands cleanly', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await main(['review']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Reviewing repository diffs'));

    await main(['verify']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Verifying repository'));

    await main(['fix']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Fixing issues'));

    consoleSpy.mockRestore();
  });
});
