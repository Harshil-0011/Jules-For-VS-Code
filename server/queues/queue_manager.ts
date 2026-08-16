export interface QueuedItem<T> {
  id: string;
  priority: number; // Higher number = higher priority
  tenantId: string;
  data: T;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
}

export class QueueManager<T> {
  private queue: QueuedItem<T>[] = [];
  private deadLetterQueue: QueuedItem<T>[] = [];
  private activeCount = 0;

  constructor(
    private concurrencyLimit: number = 5,
    private tenantLimit: number = 2
  ) {}

  public enqueue(id: string, tenantId: string, data: T, priority = 1, maxRetries = 3): boolean {
    const tenantActive = this.queue.filter((i) => i.tenantId === tenantId).length;
    if (tenantActive >= this.tenantLimit) {
      return false; // Backpressure triggered for tenant
    }

    const item: QueuedItem<T> = {
      id,
      priority,
      tenantId,
      data,
      retryCount: 0,
      maxRetries,
      createdAt: new Date().toISOString(),
    };

    this.queue.push(item);
    this.queue.sort((a, b) => b.priority - a.priority);
    return true;
  }

  public dequeue(): QueuedItem<T> | null {
    if (this.activeCount >= this.concurrencyLimit || this.queue.length === 0) {
      return null;
    }

    const item = this.queue.shift()!;
    this.activeCount++;
    return item;
  }

  public complete(itemId: string): void {
    if (this.activeCount > 0) {
      this.activeCount--;
    }
  }

  public fail(item: QueuedItem<T>): void {
    if (this.activeCount > 0) {
      this.activeCount--;
    }

    item.retryCount++;
    if (item.retryCount > item.maxRetries) {
      this.deadLetterQueue.push(item);
    } else {
      this.queue.push(item);
      this.queue.sort((a, b) => b.priority - a.priority);
    }
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getDeadLetterCount(): number {
    return this.deadLetterQueue.length;
  }
}
