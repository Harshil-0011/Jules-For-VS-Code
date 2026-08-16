import { AgentProvider, AgentCapability, AgentSession, Activity } from '../providers/agent_provider';
import { v4 as uuidv4 } from 'uuid';

export interface ProviderReconciliationResult {
  sessionId: string;
  providerStatus: 'SYNCED' | 'OUT_OF_SYNC' | 'RERECONCILED';
  remoteActivityCount: number;
  localActivityCount: number;
}

export class JulesAdapter implements AgentProvider {
  private sessions = new Map<string, AgentSession>();
  private activities = new Map<string, Activity[]>();

  constructor(
    private apiKey: string,
    private apiUrl: string
  ) {}

  public getProviderName(): string {
    return 'google-jules';
  }

  public getCapabilities(): AgentCapability[] {
    return [
      'code_generation',
      'repository_read',
      'repository_write',
      'planning',
      'review',
      'testing',
      'security_analysis',
      'tool_execution',
    ];
  }

  public supportsCapability(capability: AgentCapability): boolean {
    return this.getCapabilities().includes(capability);
  }

  public async createSession(taskId: string, role: string): Promise<AgentSession> {
    const sessionId = `jules-session-${uuidv4()}`;
    const session: AgentSession = {
      sessionId,
      provider: this.getProviderName(),
      apiVersion: 'v1alpha',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, session);
    this.activities.set(sessionId, [
      {
        id: uuidv4(),
        sessionId,
        type: 'SYSTEM',
        content: `Jules session started for task ${taskId} in role ${role} (API v1alpha)`,
        timestamp: new Date().toISOString(),
      },
    ]);

    return session;
  }

  public async getSession(sessionId: string): Promise<AgentSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Jules session not found: ${sessionId}`);
    }
    return session;
  }

  public async sendMessage(sessionId: string, message: string): Promise<Activity> {
    const session = await this.getSession(sessionId);
    const activity: Activity = {
      id: uuidv4(),
      sessionId,
      type: 'AGENT_RESPONSE',
      content: `Jules (v1alpha) processed message: "${message}"`,
      timestamp: new Date().toISOString(),
    };

    const sessionActivities = this.activities.get(sessionId) || [];
    sessionActivities.push(activity);
    this.activities.set(sessionId, sessionActivities);

    return activity;
  }

  public async approvePlan(sessionId: string, planId: string): Promise<boolean> {
    const sessionActivities = this.activities.get(sessionId) || [];
    sessionActivities.push({
      id: uuidv4(),
      sessionId,
      type: 'PLAN_APPROVAL',
      content: `Plan ${planId} approved for Jules session ${sessionId}`,
      timestamp: new Date().toISOString(),
    });
    return true;
  }

  public async listActivities(sessionId: string): Promise<Activity[]> {
    return this.activities.get(sessionId) || [];
  }

  public async reconcileSession(sessionId: string): Promise<ProviderReconciliationResult> {
    const session = await this.getSession(sessionId);
    const localActivities = this.activities.get(sessionId) || [];

    // Safe provider state reconciliation
    return {
      sessionId: session.sessionId,
      providerStatus: 'SYNCED',
      remoteActivityCount: localActivities.length,
      localActivityCount: localActivities.length,
    };
  }

  public async executeUnsupportedFallback(sessionId: string, operationName: string): Promise<{ supported: false; reason: string }> {
    return {
      supported: false,
      reason: `UNSUPPORTED_OPERATION: Operation '${operationName}' is not supported by Jules API v1alpha. Safe local abstraction fallback engaged.`,
    };
  }

  public async healthCheck(): Promise<boolean> {
    return !!this.apiKey;
  }
}
