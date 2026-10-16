import * as fs from "fs";
import * as path from "path";
import { activateIDE, WorkspaceExplorer, CodeEditor, SearchEngine, TerminalShell, GitWorkspace, DiagnosticsEngine, WebPreviewBrowser, TaskManager, AgentTeamPanel, SymbolIndexer, CheckpointManager } from "../../apps/jules-ide/index";

describe("Product 2 — Jules Coding IDE (Canonical Architecture Phase 6 & 7)", () => {
  const tmpWorkspace = path.join(process.cwd(), ".tmp_ide_test_workspace");

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

  it("should activate IDE shell and initialize all core modules including SymbolIndexer and CheckpointManager", () => {
    const ide = activateIDE(tmpWorkspace);
    expect(ide.appName).toBe("Jules Coding IDE");
    expect(ide.version).toBe("4.0.0");
    expect(ide.activeWorkspacePath).toBe(tmpWorkspace);
    expect(ide.symbolIndexer).toBeDefined();
    expect(ide.checkpointManager).toBeDefined();
    expect(ide.taskManager).toBeDefined();
    expect(ide.agentTeamPanel).toBeDefined();
  });

  it("should index codebase symbols via SymbolIndexer", () => {
    fs.writeFileSync(path.join(tmpWorkspace, "index.ts"), "export function computeTotal() { return 100; }");
    const indexer = new SymbolIndexer(tmpWorkspace);
    const symbols = indexer.indexWorkspace();
    expect(symbols.some(s => s.name === "computeTotal")).toBe(true);
  });

  it("should create and manage workspace checkpoints", () => {
    const cpMgr = new CheckpointManager();
    const cp = cpMgr.createCheckpoint("Pre-refactor state", ["index.ts"]);
    expect(cp.description).toBe("Pre-refactor state");
    expect(cpMgr.listCheckpoints().length).toBe(1);
    expect(cpMgr.rollbackCheckpoint(cp.id)).toBe(true);
  });

  it("should explore workspace files via WorkspaceExplorer", () => {
    const filePath = path.join(tmpWorkspace, "sample.ts");
    fs.writeFileSync(filePath, "console.log('Hello IDE');", "utf-8");

    const explorer = new WorkspaceExplorer(tmpWorkspace);
    const files = explorer.listFiles(".");
    expect(files.some(f => f.name === "sample.ts")).toBe(true);
  });

  it("should open, edit, and save file buffers via CodeEditor", () => {
    const editor = new CodeEditor(tmpWorkspace);
    const buffer = editor.openFile("sample.ts");
    expect(buffer.language).toBe("typescript");

    editor.editBuffer("sample.ts", "export const greeting = 'Jules IDE';");
    expect(editor.getBuffer("sample.ts")?.isDirty).toBe(true);

    editor.saveBuffer("sample.ts");
    expect(editor.getBuffer("sample.ts")?.isDirty).toBe(false);

    const savedContent = fs.readFileSync(path.join(tmpWorkspace, "sample.ts"), "utf-8");
    expect(savedContent).toBe("export const greeting = 'Jules IDE';");
  });

  it("should search codebase content via SearchEngine", () => {
    const searchEngine = new SearchEngine(tmpWorkspace);
    const results = searchEngine.search("greeting");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toContain("greeting");
  });

  it("should manage IDE task DAG states in TaskManager", () => {
    const taskMgr = new TaskManager();
    const task = taskMgr.createTask("Implement Payment Gateway");
    expect(task.title).toBe("Implement Payment Gateway");
    expect(task.status).toBe("CREATED");

    const updated = taskMgr.updateTaskStatus(task.id, "RUNNING", "Plan: Build stripe adapter");
    expect(updated?.status).toBe("RUNNING");
    expect(updated?.plan).toContain("stripe adapter");

    expect(taskMgr.listTasks().length).toBe(1);
  });

  it("should orchestrate multi-agent debate and run autonomous coding loops in AgentTeamPanel", async () => {
    const editor = new CodeEditor(tmpWorkspace);
    const panel = new AgentTeamPanel();
    const team = panel.createTeam("team-ide-1", "Frontend Engineering Team");
    expect(team.name).toBe("Frontend Engineering Team");

    const debate = await panel.runMultiAgentDebate("task-101", "Refactor Auth Architecture");
    expect(debate.consensusApproved).toBe(true);

    const result = await panel.runAutonomousLoop("ide-task-101", "Build responsive header component", editor, "components/Header.ts");
    expect(result.session.sessionId).toBeDefined();
    expect(result.activity.content).toContain("Build responsive header component");
    expect(result.verified).toBe(true);
    expect(fs.existsSync(path.join(tmpWorkspace, "components/Header.ts"))).toBe(true);
  });

  it("should execute terminal commands via TerminalShell", () => {
    const terminal = new TerminalShell(tmpWorkspace);
    const output = terminal.executeCommand("npm test");
    expect(output.exitCode).toBe(0);
    expect(output.stdout).toContain("npm test");
  });

  it("should inspect git workspace status", () => {
    const git = new GitWorkspace(tmpWorkspace);
    const status = git.getStatus();
    expect(status.branch).toBeDefined();
    expect(status.isClean).toBe(true);
  });

  it("should run diagnostics and render web preview", () => {
    const diagnostics = new DiagnosticsEngine();
    const problems = diagnostics.runDiagnostics(tmpWorkspace);
    expect(problems.length).toBeGreaterThan(0);

    const preview = new WebPreviewBrowser();
    const render = preview.renderPreview("http://localhost:3000");
    expect(render.status).toBe("READY");
    expect(render.contentSnippet).toContain("Jules Coding IDE");
  });
});
