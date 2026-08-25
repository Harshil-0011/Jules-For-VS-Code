export type AgentCapability =
  | 'code_generation'
  | 'repository_read'
  | 'repository_write'
  | 'planning'
  | 'review'
  | 'testing'
  | 'security_analysis'
  | 'tool_execution'
  | 'github_issue_assignment'
  | 'version_bump'
  | 'bug_fixing'
  | 'feature_building'
  | 'cloud_vm_sandbox'
  | 'async_background_execution'
  | 'multi_agent_development';

export interface AgentSession {
  sessionId: string;
  provider: string;
  apiVersion: string;
  status: 'INITIALIZING' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'TERMINATED';
  createdAt: string;
  vmStatus?: 'PROVISIONED' | 'CLONED' | 'RUNNING' | 'TERMINATED';
}

export interface Activity {
  id: string;
  sessionId: string;
  type: string;
  content: string;
  timestamp: string;
}

export interface AgentProvider {
  getProviderName(): string;
  getCapabilities(): AgentCapability[];
  createSession(taskId: string, role: string): Promise<AgentSession>;
  getSession(sessionId: string): Promise<AgentSession>;
  sendMessage(sessionId: string, message: string): Promise<Activity>;
  approvePlan(sessionId: string, planId: string): Promise<boolean>;
  listActivities(sessionId: string): Promise<Activity[]>;
  healthCheck(): Promise<boolean>;
}
