import { GitManager } from '../git/git_manager';
import { VerificationEngine } from '../verification/verification_engine';
import { PolicyEngine } from '../policies/policy_engine';
import { RiskEngine } from '../policies/risk_engine';

export interface MergeResult {
  success: boolean;
  merged: boolean;
  reason: string;
  requiresApproval: boolean;
}

export class MergeCoordinator {
  constructor(
    private gitManager: GitManager,
    private verificationEngine: VerificationEngine,
    private policyEngine: PolicyEngine,
    private riskEngine: RiskEngine
  ) {}

  public async evaluateMerge(
    taskId: string,
    changeDescription: string,
    filesTouched: string[],
    hasHumanApproval: boolean = false
  ): Promise<MergeResult> {
    const baseCheck = await this.gitManager.validateBaseCommit(taskId);
    if (!baseCheck.valid) {
      return {
        success: false,
        merged: false,
        reason: `STALE_BASE_COMMIT: Base commit ${baseCheck.expectedBase} does not match current HEAD ${baseCheck.currentHead}. Rebase required.`,
        requiresApproval: false,
      };
    }

    const riskLevel = this.riskEngine.classifyRisk(changeDescription, filesTouched);

    const policyDecision = this.policyEngine.evaluate('git', 'merge', { riskLevel, filesTouched });
    if (policyDecision.decision === 'DENY') {
      return {
        success: false,
        merged: false,
        reason: `POLICY_DENIED: ${policyDecision.reason}`,
        requiresApproval: false,
      };
    }

    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH' || policyDecision.decision === 'REQUIRES_APPROVAL') {
      if (!hasHumanApproval) {
        return {
          success: false,
          merged: false,
          reason: `APPROVAL_REQUIRED: Risk level is ${riskLevel}. Human approval required before merge.`,
          requiresApproval: true,
        };
      }
    }

    const evidenceList = await this.verificationEngine.verifyClaims({
      taskId,
      runBuild: true,
      runTests: true,
    });

    const allVerified = evidenceList.every((e) => e.status === 'VERIFIED');
    if (!allVerified) {
      return {
        success: false,
        merged: false,
        reason: 'VERIFICATION_FAILED: One or more evidence checks failed.',
        requiresApproval: false,
      };
    }

    return {
      success: true,
      merged: true,
      reason: 'All checks passed. Merge executed successfully.',
      requiresApproval: false,
    };
  }
}
