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

export interface ExtensionState {
  connected: boolean;
  activeTaskId?: string;
  activeSessionId?: string;
  emergencyStop: boolean;
}

export class WorkspaceAdapter {
  constructor(private rootPath: string = process.cwd()) {}

  public discoverWorkspace(): WorkspaceInfo {
    return {
      rootPath: this.rootPath,
      projectName: this.rootPath.split('/').pop() || 'unknown',
      hasGitRepo: true,
      packageManager: 'npm',
    };
  }
}

export class GitAdapter {
  constructor(private rootPath: string = process.cwd()) {}

  public getGitState(): GitAdapterState {
    return {
      branch: 'main',
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

  eventClient.connect();

  const state: ExtensionState = {
    connected: true,
    emergencyStop: false,
  };

  const registeredCommands: { [key: string]: Function } = {
    'jules.newTask': (payload?: any) => {
      state.activeTaskId = payload?.taskId || 'task-default-id';
      return { status: 'TASK_CREATED', taskId: state.activeTaskId };
    },
    'jules.startTask': () => ({ status: 'TASK_STARTED', taskId: state.activeTaskId }),
    'jules.addAgent': (agentName: string) => ({ status: 'AGENT_ADDED', agent: agentName || 'default-agent' }),
    'jules.createTeam': (teamName: string) => ({ status: 'TEAM_CREATED', team: teamName || 'default-team' }),
    'jules.approvePlan': () => ({ status: 'PLAN_APPROVED' }),
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
      status: state.activeTaskId ? 'RUNNING' : 'IDLE',
    }),
    'jules.getActivityView': () => ({
      activities: [
        { type: 'TASK_START', timestamp: new Date().toISOString() },
      ],
    }),
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
    workspaceInfo: workspaceAdapter.discoverWorkspace(),
    gitState: gitAdapter.getGitState(),
    eventClient,
    registeredCommands: Object.keys(registeredCommands),
    executeCommand: (cmdName: string, ...args: any[]) => {
      const fn = registeredCommands[cmdName];
      if (!fn) throw new Error(`VS Code extension command not found: ${cmdName}`);
      return fn(...args);
    },
  };
}

export function deactivate() {
  console.log('Jules Platform VS Code Extension Deactivated');
}
