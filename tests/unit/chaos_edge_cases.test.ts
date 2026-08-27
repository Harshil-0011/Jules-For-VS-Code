import * as fs from 'fs';
import * as path from 'path';
import { activate as activateExtension } from '../../apps/jules-extension/extension/extension';
import { activateIDE } from '../../apps/jules-ide/index';
import { runAgentLoop, checkPolicy, CLIToolkit, SessionManager } from '../../apps/jules-cli/index';

describe('Comprehensive Chaos & Edge-Case Vulnerability Test Suite', () => {
  const tmpChaosRepo = path.join(process.cwd(), '.tmp_chaos_repo');

  beforeAll(() => {
    if (!fs.existsSync(tmpChaosRepo)) {
      fs.mkdirSync(tmpChaosRepo, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tmpChaosRepo)) {
      fs.rmSync(tmpChaosRepo, { recursive: true, force: true });
    }
  });

  describe('VS Code Extension Edge Cases & Emergency Stop', () => {
    it('should block operations when emergency stop is triggered in extension', async () => {
      const ext = activateExtension();
      await ext.executeCommand('jules.emergencyStop');

      await expect(
        ext.executeCommand('jules.newTask', { title: 'Unauthorized Task' })
      ).rejects.toThrow('EMERGENCY_STOP_ACTIVE');

      await ext.executeCommand('jules.resetEmergencyStop');
      const res = await ext.executeCommand('jules.newTask', { title: 'Authorized Task' });
      expect(res.status).toBe('TASK_CREATED');
    });

    it('should reject invalid command arguments gracefully', async () => {
      const ext = activateExtension();
      await expect(
        ext.executeCommand('jules.versionBump', {})
      ).rejects.toThrow('INVALID_ARGUMENT');

      await expect(
        ext.executeCommand('jules.assignGitHubIssue', {})
      ).rejects.toThrow('INVALID_ARGUMENT');
    });
  });

  describe('Jules Coding IDE Edge Cases & Fault Recovery', () => {
    it('should handle non-existent file opens without crashing code editor', () => {
      const ide = activateIDE(tmpChaosRepo);
      const buffer = ide.editor.openFile('non_existent.ts');
      expect(buffer.content).toBe('');
      expect(buffer.language).toBe('typescript');
    });

    it('should handle empty search queries in search engine gracefully', () => {
      const ide = activateIDE(tmpChaosRepo);
      const matches = ide.search.search('');
      expect(matches).toEqual([]);
    });

    it('should handle invalid web preview URLs gracefully', () => {
      const ide = activateIDE(tmpChaosRepo);
      const render = ide.preview.renderPreview('invalid-url');
      expect(render.status).toBe('ERROR');
      expect(render.contentSnippet).toContain('Invalid URL');
    });
  });

  describe('Jules Code CLI Edge Cases & Security Policies', () => {
    it('should throw error when reading non-existent file in CLIToolkit', () => {
      const toolkit = new CLIToolkit(tmpChaosRepo);
      expect(() => toolkit.readFile('missing_file.txt')).toThrow('File not found');
    });

    it('should block mutating operations in ASK mode', () => {
      const policy = checkPolicy('write', 'ASK');
      expect(policy.allowed).toBe(false);
      expect(policy.reason).toContain('APPROVAL_REQUIRED');
    });

    it('should return null for non-existent session lookup in SessionManager', () => {
      const mgr = new SessionManager(tmpChaosRepo);
      const session = mgr.getSession('non-existent-session-id');
      expect(session).toBeNull();
    });

    it('should execute agent loop safely in READ_ONLY permission mode without mutating files', async () => {
      const result = await runAgentLoop('Inspect codebase security', {
        mode: 'review',
        permissionMode: 'READ_ONLY',
        repoPath: tmpChaosRepo,
      });

      expect(result.status).toBe('BLOCKED');
      expect(result.changesApplied).toBe(false);
    });
  });
});
