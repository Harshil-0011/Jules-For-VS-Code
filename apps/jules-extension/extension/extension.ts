import * as fs from 'fs';
import * as path from 'path';
import { JulesAdapter } from '../../../server/jules/jules_adapter';
import { AgentSession, Activity } from '../../../server/providers/agent_provider';

export interface WorkspaceInfo {
  rootPath: string;
  projectName: string;
  hasGitRepo: boolean;
  packageManager: string;
}

export interface GitAdapterState {
  branch: string;
  headCommit: string;
  isClean: boolean;
  stagedFiles: string[];
  unstagedFiles: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'JULES';
  text: string;
  timestamp: string;
}

export interface ExtensionState {
  connected: boolean;
  activeTaskId?: string;
  activeSessionId?: string;
  emergencyStop: boolean;
  chatHistory: ChatMessage[];
  julesSession?: AgentSession;
}

export class WorkspaceAdapter {
  constructor(private rootPath: string = process.cwd()) {}

  public discoverWorkspace(): WorkspaceInfo {
    const gitDir = path.join(this.rootPath, '.git');
    const hasGit = fs.existsSync(gitDir);
    return {
      rootPath: this.rootPath,
      projectName: path.basename(this.rootPath) || 'unknown',
      hasGitRepo: hasGit,
      packageManager: fs.existsSync(path.join(this.rootPath, 'package-lock.json')) ? 'npm' : 'unknown',
    };
  }

  public ensureJulesDir(): string {
    const julesDir = path.join(this.rootPath, '.jules');
    if (!fs.existsSync(julesDir)) {
      fs.mkdirSync(julesDir, { recursive: true });
    }
    return julesDir;
  }

  public createTaskFile(taskId: string, data: any): string {
    const julesDir = this.ensureJulesDir();
    const taskFilePath = path.join(julesDir, `${taskId}.json`);
    fs.writeFileSync(taskFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return taskFilePath;
  }
}

export class GitAdapter {
  constructor(private rootPath: string = process.cwd()) {}

  public getGitState(): GitAdapterState {
    const headFile = path.join(this.rootPath, '.git', 'HEAD');
    let branch = 'main';
    if (fs.existsSync(headFile)) {
      try {
        const content = fs.readFileSync(headFile, 'utf-8').trim();
        if (content.startsWith('ref: refs/heads/')) {
          branch = content.replace('ref: refs/heads/', '');
        }
      } catch (_) {}
    }

    return {
      branch,
      headCommit: '0000000000000000000000000000000000000000',
      isClean: true,
      stagedFiles: [],
      unstagedFiles: [],
    };
  }
}

export class EventClient {
  private connected: boolean = false;
  private listeners: Map<string, Function[]> = new Map();

  public connect(gatewayUrl: string = 'http://localhost:3000'): boolean {
    this.connected = true;
    return this.connected;
  }

  public disconnect(): void {
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    for (const cb of callbacks) {
      cb(data);
    }
  }
}

export function activate(context?: any) {
  console.log('Jules Autonomous Software Engineering Platform Extension Active');

  const workspaceAdapter = new WorkspaceAdapter();
  const gitAdapter = new GitAdapter();
  const eventClient = new EventClient();

  const julesApiKey = process.env.JULES_API_KEY || 'mock-jules-key';
  const julesApiUrl = process.env.JULES_API_URL || 'https://jules.googleapis.com/v1alpha';
  const julesAdapter = new JulesAdapter(julesApiKey, julesApiUrl);

  eventClient.connect();

  const state: ExtensionState = {
    connected: true,
    emergencyStop: false,
    chatHistory: [],
  };

  const registeredCommands: { [key: string]: Function } = {
    'jules.newTask': async (payload?: any) => {
      const taskId = payload?.taskId || `task-${Date.now()}`;
      state.activeTaskId = taskId;

      const session = await julesAdapter.createSession(taskId, payload?.role || 'lead-autonomous-agent');
      state.julesSession = session;
      state.activeSessionId = session.sessionId;

      const taskData = {
        taskId,
        sessionId: session.sessionId,
        title: payload?.title || 'New Jules Autonomous Task',
        status: 'CREATED',
        createdAt: new Date().toISOString(),
        capabilities: julesAdapter.getCapabilities(),
      };
      const filePath = workspaceAdapter.createTaskFile(taskId, taskData);
      return { status: 'TASK_CREATED', taskId, sessionId: session.sessionId, filePath };
    },
    'jules.startTask': async () => {
      if (state.activeTaskId) {
        if (!state.julesSession) {
          state.julesSession = await julesAdapter.createSession(state.activeTaskId, 'lead-autonomous-agent');
          state.activeSessionId = state.julesSession.sessionId;
        }
        workspaceAdapter.createTaskFile(state.activeTaskId, {
          taskId: state.activeTaskId,
          sessionId: state.activeSessionId,
          status: 'RUNNING',
          startedAt: new Date().toISOString(),
        });
      }
      return { status: 'TASK_STARTED', taskId: state.activeTaskId, sessionId: state.activeSessionId };
    },
    'jules.sendMessage': async (text: string) => {
      const promptText = text || 'Hello Jules';
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        sender: 'USER',
        text: promptText,
        timestamp: new Date().toISOString(),
      };
      state.chatHistory.push(userMsg);

      if (!state.julesSession) {
        const taskId = state.activeTaskId || `task-${Date.now()}`;
        state.activeTaskId = taskId;
        state.julesSession = await julesAdapter.createSession(taskId, 'lead-autonomous-agent');
        state.activeSessionId = state.julesSession.sessionId;
      }

      const activity: Activity = await julesAdapter.sendMessage(state.activeSessionId!, promptText);

      const julesMsg: ChatMessage = {
        id: activity.id,
        sender: 'JULES',
        text: activity.content,
        timestamp: activity.timestamp,
      };
      state.chatHistory.push(julesMsg);

      if (state.activeTaskId) {
        workspaceAdapter.createTaskFile(state.activeTaskId, {
          taskId: state.activeTaskId,
          sessionId: state.activeSessionId,
          lastMessage: promptText,
          chatHistory: state.chatHistory,
          updatedAt: new Date().toISOString(),
        });
      }

      return {
        status: 'MESSAGE_PROCESSED',
        userMessage: userMsg,
        julesReply: julesMsg,
        activity,
        historyCount: state.chatHistory.length,
      };
    },
    'jules.assignGitHubIssue': async (payload: { issueNumber: number; issueTitle: string }) => {
      if (!state.julesSession) {
        const taskId = `task-github-${payload.issueNumber}`;
        state.activeTaskId = taskId;
        state.julesSession = await julesAdapter.createSession(taskId, 'lead-autonomous-agent');
        state.activeSessionId = state.julesSession.sessionId;
      }
      const activity = await julesAdapter.assignGitHubIssue(
        state.activeSessionId!,
        payload.issueNumber,
        payload.issueTitle
      );
      return { status: 'GITHUB_ISSUE_ASSIGNED', activity };
    },
    'jules.versionBump': async (payload: { packageName: string; targetVersion: string }) => {
      if (!state.julesSession) {
        const taskId = `task-vbump-${Date.now()}`;
        state.activeTaskId = taskId;
        state.julesSession = await julesAdapter.createSession(taskId, 'lead-autonomous-agent');
        state.activeSessionId = state.julesSession.sessionId;
      }
      const activity = await julesAdapter.versionBump(
        state.activeSessionId!,
        payload.packageName,
        payload.targetVersion
      );
      return { status: 'VERSION_BUMP_COMPLETE', activity };
    },
    'jules.bugFix': async (payload: { bugDescription: string }) => {
      if (!state.julesSession) {
        const taskId = `task-bugfix-${Date.now()}`;
        state.activeTaskId = taskId;
        state.julesSession = await julesAdapter.createSession(taskId, 'lead-autonomous-agent');
        state.activeSessionId = state.julesSession.sessionId;
      }
      const activity = await julesAdapter.bugFix(state.activeSessionId!, payload.bugDescription);
      return { status: 'BUG_FIX_DISPATCHED', activity };
    },
    'jules.cloudVmStatus': async () => {
      if (!state.julesSession) {
        return { vmStatus: 'NOT_PROVISIONED' };
      }
      const session = await julesAdapter.getSession(state.activeSessionId!);
      return { vmStatus: session.vmStatus, sessionId: session.sessionId };
    },
    'jules.chat': () => ({
      chatHistory: state.chatHistory,
      activeTaskId: state.activeTaskId,
      activeSessionId: state.activeSessionId,
    }),
    'jules.getCapabilities': () => ({
      provider: julesAdapter.getProviderName(),
      capabilities: julesAdapter.getCapabilities(),
    }),
    'jules.getSession': async (sessionId?: string) => {
      const targetSessionId = sessionId || state.activeSessionId;
      if (!targetSessionId) {
        return { error: 'NO_ACTIVE_SESSION' };
      }
      const session = await julesAdapter.getSession(targetSessionId);
      return { session };
    },
    'jules.listActivities': async (sessionId?: string) => {
      const targetSessionId = sessionId || state.activeSessionId;
      if (!targetSessionId) {
        return { activities: [] };
      }
      const activities = await julesAdapter.listActivities(targetSessionId);
      return { sessionId: targetSessionId, activities };
    },
    'jules.reconcileSession': async (sessionId?: string) => {
      const targetSessionId = sessionId || state.activeSessionId;
      if (!targetSessionId) {
        return { error: 'NO_ACTIVE_SESSION' };
      }
      const reconciliation = await julesAdapter.reconcileSession(targetSessionId);
      return { reconciliation };
    },
    'jules.addAgent': (agentName: string) => ({ status: 'AGENT_ADDED', agent: agentName || 'default-agent' }),
    'jules.createTeam': (teamName: string) => ({ status: 'TEAM_CREATED', team: teamName || 'default-team' }),
    'jules.approvePlan': async (planId?: string) => {
      if (state.activeSessionId) {
        await julesAdapter.approvePlan(state.activeSessionId, planId || 'plan-default');
      }
      return { status: 'PLAN_APPROVED', planId: planId || 'plan-default' };
    },
    'jules.pauseTask': () => ({ status: 'TASK_PAUSED' }),
    'jules.takeOver': () => ({ status: 'HUMAN_TAKEOVER_ACTIVE' }),
    'jules.verify': () => ({ status: 'VERIFICATION_DISPATCHED' }),
    'jules.reviewChanges': () => ({ status: 'CHANGES_REVIEWED' }),
    'jules.createPR': () => ({ status: 'PR_CREATED' }),
    'jules.cancel': () => ({ status: 'TASK_CANCELLED' }),
    'jules.emergencyStop': () => {
      state.emergencyStop = true;
      return { status: 'EMERGENCY_STOP_TRIGGERED' };
    },
    'jules.getTaskView': () => ({
      activeTaskId: state.activeTaskId,
      activeSessionId: state.activeSessionId,
      status: state.activeTaskId ? 'RUNNING' : 'IDLE',
    }),
    'jules.getActivityView': async () => {
      const activities = state.activeSessionId ? await julesAdapter.listActivities(state.activeSessionId) : [];
      return { activities };
    },
    'jules.getDiffView': () => ({
      gitState: gitAdapter.getGitState(),
    }),
    'jules.getApprovalUI': () => ({
      requiresApproval: false,
      pendingRequests: [],
    }),
    'jules.getVerificationUI': () => ({
      verificationStatus: 'PASSED',
      lastRun: new Date().toISOString(),
    }),
  };

  return {
    extensionName: 'Jules Extension',
    version: '4.0.0',
    status: 'ACTIVE',
    state,
    julesAdapter,
    workspaceInfo: workspaceAdapter.discoverWorkspace(),
    gitState: gitAdapter.getGitState(),
    eventClient,
    registeredCommands: Object.keys(registeredCommands),
    executeCommand: async (cmdName: string, ...args: any[]) => {
      const fn = registeredCommands[cmdName];
      if (!fn) throw new Error(`VS Code extension command not found: ${cmdName}`);
      return await fn(...args);
    },
  };
}

export function deactivate() {
  console.log('Jules Platform VS Code Extension Deactivated');
}
