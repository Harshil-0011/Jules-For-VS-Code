import { JulesAdapter } from '../../server/jules/jules_adapter';

describe('JulesAdapter Integration', () => {
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
});
