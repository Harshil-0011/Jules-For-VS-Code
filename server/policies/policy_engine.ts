export interface PolicyRule {
  id: string;
  resource: string;
  action: string;
  decision: 'ALLOW' | 'DENY' | 'REQUIRES_APPROVAL';
  reason: string;
}

export class PolicyEngine {
  private rules: PolicyRule[] = [
    {
      id: 'rule-prod-deploy',
      resource: 'deployment',
      action: 'deploy_production',
      decision: 'REQUIRES_APPROVAL',
      reason: 'Production deployments require human signoff',
    },
    {
      id: 'rule-db-migration',
      resource: 'database',
      action: 'migration',
      decision: 'REQUIRES_APPROVAL',
      reason: 'Database migrations require human signoff',
    },
  ];

  public evaluate(resource: string, action: string, context?: any): { decision: 'ALLOW' | 'DENY' | 'REQUIRES_APPROVAL'; reason: string } {
    const matchedRule = this.rules.find(
      (r) => r.resource === resource && r.action === action
    );

    if (matchedRule) {
      return { decision: matchedRule.decision, reason: matchedRule.reason };
    }

    return { decision: 'ALLOW', reason: 'Default policy allows non-restricted operation' };
  }
}
