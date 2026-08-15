import { QueueManager } from '../../server/queues/queue_manager';
import { DatabaseService } from '../../server/persistence/database';
import { LeaseManager } from '../../server/execution/leases';

describe('Reliability, Queues & Lease Reclamation', () => {
  let dbService: DatabaseService;
  let leaseManager: LeaseManager;

  beforeEach(() => {
    dbService = new DatabaseService(':memory:');
    leaseManager = new LeaseManager(dbService.getDb());
  });

  afterEach(() => {
    dbService.close();
  });

  it('should prioritize higher priority items in queue', () => {
    const q = new QueueManager<string>(5, 5);

    q.enqueue('job-low', 't1', 'low payload', 1);
    q.enqueue('job-high', 't1', 'high payload', 10);

    const first = q.dequeue();
    expect(first?.id).toBe('job-high');
  });

  it('should move failed items to dead-letter queue when max retries exceeded', () => {
    const q = new QueueManager<string>(5, 5);
    q.enqueue('job-1', 't1', 'payload', 1, 1);

    const item = q.dequeue()!;
    q.fail(item); // retryCount = 1

    const retried = q.dequeue()!;
    q.fail(retried); // retryCount = 2 > maxRetries (1) -> moved to DLQ

    expect(q.getQueueLength()).toBe(0);
    expect(q.getDeadLetterCount()).toBe(1);
  });

  it('should reclaim expired leases from crashed workers', async () => {
    // Acquire lease with 1ms TTL
    leaseManager.acquireLease('res-1', 'crashed-worker', 1);

    await new Promise((resolve) => setTimeout(resolve, 10));

    const reclaimed = leaseManager.reclaimExpiredLeases();
    expect(reclaimed).toBe(1);

    // New worker can acquire lease
    const newTok = leaseManager.acquireLease('res-1', 'new-worker', 5000);
    expect(newTok).toBe(1);
  });
});
