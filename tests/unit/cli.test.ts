import * as fs from "fs";
import * as path from "path";
import { Readable, Writable } from "stream";
import { runAgentLoop, inspectRepository, checkPolicy, SessionManager, parseCLIArgs, CLIToolkit, startInteractiveREPL, main, CustomRulesEngine, ContextTagExtractor } from "../../apps/jules-cli/index";

describe("Product 3 — Jules Code CLI (Phase 4 Canonical Architecture)", () => {
  const tmpRepo = path.join(process.cwd(), ".tmp_cli_test_repo");

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

  it("should inspect repository state accurately and load custom .julesrules", () => {
    fs.writeFileSync(path.join(tmpRepo, ".julesrules"), "Always run tests before PR\nDeny unsafe network writes");
    const inspection = inspectRepository(tmpRepo);
    expect(inspection.rootPath).toBe(tmpRepo);
    expect(inspection.projectName).toBe(".tmp_cli_test_repo");
    expect(inspection.julesRules?.length).toBe(2);
  });

  it("should extract @file context tags from prompts", () => {
    fs.writeFileSync(path.join(tmpRepo, "service.ts"), "export const a = 1;");
    const parsed = ContextTagExtractor.parsePrompt("Refactor function in @service.ts", tmpRepo);
    expect(parsed.attachedFiles).toContain("service.ts");
    expect(parsed.fileContents.get("service.ts")).toContain("export const a = 1;");
  });

  it("should perform toolkit file operations on disk", () => {
    const toolkit = new CLIToolkit(tmpRepo);
    toolkit.writeFile("sample.txt", "Hello Jules CLI");
    expect(fs.existsSync(path.join(tmpRepo, "sample.txt"))).toBe(true);

    const content = toolkit.readFile("sample.txt");
    expect(content).toBe("Hello Jules CLI");

    const files = toolkit.listFiles(".");
    expect(files).toContain("sample.txt");
  });

  it("should parse CLI arguments, subcommands, and flags correctly", () => {
    const args1 = parseCLIArgs(["--task", "Fix test", "--non-interactive"]);
    expect(args1.task).toBe("Fix test");
    expect(args1.nonInteractive).toBe(true);
    expect(args1.mode).toBe("headless");

    const args2 = parseCLIArgs(["sources", "list"]);
    expect(args2.subCommand).toBe("sources");

    const args3 = parseCLIArgs(["--source", "sources/github/owner/repo", "--branch", "feature/auth", "--automation-mode", "AUTO_CREATE_PR"]);
    expect(args3.source).toBe("sources/github/owner/repo");
    expect(args3.branch).toBe("feature/auth");
    expect(args3.automationMode).toBe("AUTO_CREATE_PR");
  });

  it("should enforce permission modes during policy checks", () => {
    const readOnlyWrite = checkPolicy("write", "READ_ONLY");
    expect(readOnlyWrite.allowed).toBe(false);

    const askWrite = checkPolicy("write", "ASK");
    expect(askWrite.allowed).toBe(false);

    const autoWrite = checkPolicy("write", "AUTO");
    expect(autoWrite.allowed).toBe(true);
  });

  it("should execute full agent loop with context metrics and write .jules/cli-last-run.json on disk", async () => {
    const result = await runAgentLoop("Fix failing test in auth module @service.ts", {
      mode: "single_task",
      permissionMode: "AUTO",
      repoPath: tmpRepo,
      source: "sources/github/owner/repo",
      branch: "main",
      automationMode: "AUTO_CREATE_PR",
    });

    expect(result.status).toBe("PASSED");
    expect(result.changesApplied).toBe(true);
    expect(result.verificationPassed).toBe(true);
    expect(result.metrics.totalTokens).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(tmpRepo, ".jules", "cli-last-run.json"))).toBe(true);
  });

  it("should block agent loop when policy forbids action in READ_ONLY mode", async () => {
    const result = await runAgentLoop("Attempt unauthorized write", {
      mode: "single_task",
      permissionMode: "READ_ONLY",
      repoPath: tmpRepo,
    });

    expect(result.status).toBe("BLOCKED");
    expect(result.changesApplied).toBe(false);
  });

  it("should store and resume CLI sessions", () => {
    const sessionMgr = new SessionManager(tmpRepo);
    const session = {
      sessionId: "test-session-cli-1",
      task: "Refactor logger",
      mode: "single_task" as const,
      permissionMode: "AUTO" as const,
      repository: "test-repo",
      branch: "main",
      status: "COMPLETED" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: ["Task created", "Completed"],
    };

    sessionMgr.saveSession(session);
    const sessions = sessionMgr.listSessions();
    expect(sessions.length).toBeGreaterThan(0);

    const fetched = sessionMgr.getSession("test-session-cli-1");
    expect(fetched?.task).toBe("Refactor logger");
  });

  it("should run interactive REPL terminal shell session with slash commands including /cost and /diff", (done) => {
    const input = new Readable({ read() {} });
    const output = new Writable({ write(_chunk, _encoding, callback) { callback(); } });

    startInteractiveREPL("AUTO", { inputStream: input, outputStream: output, autoExitOnTask: true });

    input.push("/help\n");
    input.push("/status\n");
    input.push("/diff\n");
    input.push("/cost\n");
    input.push("/rollback\n");
    input.push("/sources\n");
    input.push("/mode read_only\n");
    input.push("/exit\n");

    setTimeout(() => {
      done();
    }, 50);
  });

  it("should execute main CLI commands cleanly for sources and exec", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await main(["sources"]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Jules Sources"));

    await main(["exec", "Build feature"]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("starting task"));

    consoleSpy.mockRestore();
  });
});
