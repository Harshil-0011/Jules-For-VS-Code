import { DatabaseService } from '../../server/persistence/database';
import { LeaseManager } from '../../server/execution/leases';

describe('LeaseManager & Distributed Concurrency', () => {
  let dbService: DatabaseService;
  let leaseManager: LeaseManager;

  beforeEach(() => {
    dbService = new DatabaseService(':memory:');
    leaseManager = new LeaseManager(dbService.getDb());
  });

  afterEach(() => {
    dbService.close();
  });

  it('should grant lease and fence out concurrent workers', () => {
    const resourceId = 'task-workspace-1';

    const token1 = leaseManager.acquireLease(resourceId, 'worker-1', 5000);
    expect(token1).toBe(1);

    const token2 = leaseManager.acquireLease(resourceId, 'worker-2', 5000);
    expect(token2).toBeNull();

    expect(leaseManager.validateFenceToken(resourceId, 'worker-1', token1!)).toBe(true);
    expect(leaseManager.validateFenceToken(resourceId, 'worker-1', 99)).toBe(false);
  });
});
