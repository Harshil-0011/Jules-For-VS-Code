export type TaskStatus =
  | 'CREATED'
  | 'PENDING_DEPENDENCIES'
  | 'READY'
  | 'SCHEDULED'
  | 'RUNNING'
  | 'VERIFYING'
  | 'AWAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'BLOCKED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskBudget {
  maxRuntimeSec: number;
  maxToolCalls: number;
  maxCostUsd: number;
  maxRetries: number;
}

export interface Task {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  riskLevel: RiskLevel;
  budget: TaskBudget;
  parentId?: string;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Attempt {
  id: string;
  taskId: string;
  attemptNumber: number;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export interface Execution {
  id: string;
  attemptId: string;
  agentId: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
}

export interface Artifact {
  id: string;
  executionId: string;
  type: string;
  uri: string;
  hash: string;
  createdAt: string;
}

export interface Evidence {
  id: string;
  taskId: string;
  claim: string;
  status: 'UNVERIFIED' | 'WEAK' | 'SUPPORTED' | 'STRONGLY_SUPPORTED' | 'VERIFIED' | 'DISPUTED' | 'REJECTED';
  details: Record<string, any>;
  createdAt: string;
}

export interface Decision {
  id: string;
  taskId: string;
  decision: 'APPROVED' | 'REJECTED' | 'ESCALATED';
  reason: string;
  decidedBy: string;
  timestamp: string;
}
