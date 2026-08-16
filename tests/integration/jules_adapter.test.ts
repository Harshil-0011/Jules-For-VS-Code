import { JulesAdapter } from '../../server/jules/jules_adapter';

describe('JulesAdapter Phase 4 Features', () => {
  let adapter: JulesAdapter;

  beforeEach(() => {
    adapter = new JulesAdapter('test-api-key', 'https://jules.googleapis.com/v1alpha');
  });

  it('should initialize session and track activities', async () => {
    const session = await adapter.createSession('task-123', 'LEAD');
    expect(session.sessionId).toBeDefined();
    expect(session.provider).toBe('google-jules');

    const activity = await adapter.sendMessage(session.sessionId, 'Implement login endpoint');
    expect(activity.content).toContain('Implement login endpoint');

    const activities = await adapter.listActivities(session.sessionId);
    expect(activities.length).toBeGreaterThanOrEqual(2);
  });

  it('should check capabilities correctly', () => {
    expect(adapter.supportsCapability('code_generation')).toBe(true);
    expect(adapter.supportsCapability('planning')).toBe(true);
  });

  it('should reconcile provider session state', async () => {
    const session = await adapter.createSession('task-456', 'PLANNER');
    const result = await adapter.reconcileSession(session.sessionId);

    expect(result.providerStatus).toBe('SYNCED');
    expect(result.localActivityCount).toBe(1);
  });

  it('should handle unsupported operations gracefully without faking success', async () => {
    const session = await adapter.createSession('task-789', 'BACKEND_WORKER');
    const fallback = await adapter.executeUnsupportedFallback(session.sessionId, 'direct_cluster_deploy');

    expect(fallback.supported).toBe(false);
    expect(fallback.reason).toContain('UNSUPPORTED_OPERATION');
  });
});
