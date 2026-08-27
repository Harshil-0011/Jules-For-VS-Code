import * as fs from 'fs';
import * as path from 'path';
import { activateIDE, WorkspaceExplorer, CodeEditor, SearchEngine, TerminalShell, GitWorkspace, DiagnosticsEngine, WebPreviewBrowser, JulesAgentPanel } from '../../apps/jules-ide/index';

describe('Product 2 — Jules Coding IDE (Canonical Architecture Phase 6 & 7)', () => {
  const tmpWorkspace = path.join(process.cwd(), '.tmp_ide_test_workspace');

  beforeAll(() => {
    if (!fs.existsSync(tmpWorkspace)) {
      fs.mkdirSync(tmpWorkspace, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tmpWorkspace)) {
      fs.rmSync(tmpWorkspace, { recursive: true, force: true });
    }
  });

  it('should activate IDE shell and initialize all core modules', () => {
    const ide = activateIDE(tmpWorkspace);
    expect(ide.appName).toBe('Jules Coding IDE');
    expect(ide.version).toBe('4.0.0');
    expect(ide.activeWorkspacePath).toBe(tmpWorkspace);
    expect(ide.explorer).toBeDefined();
    expect(ide.editor).toBeDefined();
    expect(ide.search).toBeDefined();
    expect(ide.terminal).toBeDefined();
    expect(ide.git).toBeDefined();
    expect(ide.diagnostics).toBeDefined();
    expect(ide.preview).toBeDefined();
    expect(ide.julesPanel).toBeDefined();
  });

  it('should explore workspace files via WorkspaceExplorer', () => {
    const filePath = path.join(tmpWorkspace, 'sample.ts');
    fs.writeFileSync(filePath, 'console.log("Hello IDE");', 'utf-8');

    const explorer = new WorkspaceExplorer(tmpWorkspace);
    const files = explorer.listFiles('.');
    expect(files.some(f => f.name === 'sample.ts')).toBe(true);
  });

  it('should open, edit, and save file buffers via CodeEditor', () => {
    const editor = new CodeEditor(tmpWorkspace);
    const buffer = editor.openFile('sample.ts');
    expect(buffer.language).toBe('typescript');

    editor.editBuffer('sample.ts', 'export const greeting = "Jules IDE";');
    expect(editor.getBuffer('sample.ts')?.isDirty).toBe(true);

    editor.saveBuffer('sample.ts');
    expect(editor.getBuffer('sample.ts')?.isDirty).toBe(false);

    const savedContent = fs.readFileSync(path.join(tmpWorkspace, 'sample.ts'), 'utf-8');
    expect(savedContent).toBe('export const greeting = "Jules IDE";');
  });

  it('should search codebase content via SearchEngine', () => {
    const searchEngine = new SearchEngine(tmpWorkspace);
    const results = searchEngine.search('greeting');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toContain('greeting');
  });

  it('should execute terminal commands via TerminalShell', () => {
    const terminal = new TerminalShell(tmpWorkspace);
    const output = terminal.executeCommand('npm test');
    expect(output.exitCode).toBe(0);
    expect(output.stdout).toContain('npm test');
  });

  it('should inspect git workspace status', () => {
    const git = new GitWorkspace(tmpWorkspace);
    const status = git.getStatus();
    expect(status.branch).toBeDefined();
    expect(status.isClean).toBe(true);
  });

  it('should run diagnostics and render web preview', () => {
    const diagnostics = new DiagnosticsEngine();
    const problems = diagnostics.runDiagnostics(tmpWorkspace);
    expect(problems.length).toBeGreaterThan(0);

    const preview = new WebPreviewBrowser();
    const render = preview.renderPreview('http://localhost:3000');
    expect(render.status).toBe('READY');
    expect(render.contentSnippet).toContain('Jules Coding IDE');
  });

  it('should handle agent session and prompts in JulesAgentPanel', async () => {
    const panel = new JulesAgentPanel();
    const session = await panel.startAgentSession('ide-task-001');
    expect(session.sessionId).toBeDefined();

    const activity = await panel.sendPrompt(session.sessionId, 'Implement user profile editor');
    expect(activity.content).toContain('Implement user profile editor');

    const activities = await panel.listActivities(session.sessionId);
    expect(activities.length).toBeGreaterThanOrEqual(2);
  });
});
