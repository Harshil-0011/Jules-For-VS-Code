export interface MemoryItem {
  id: string;
  scope: 'GLOBAL' | 'PROJECT' | 'TASK';
  scopeId: string;
  key: string;
  value: string;
  provenance: {
    sourceTaskId?: string;
    agentId?: string;
    timestamp: string;
  };
}

export class ContextEngine {
  private memory = new Map<string, MemoryItem>();

  public store(item: MemoryItem): void {
    this.memory.set(item.id, item);
  }

  public query(scope: 'GLOBAL' | 'PROJECT' | 'TASK', scopeId: string): MemoryItem[] {
    return Array.from(this.memory.values()).filter(
      (m) => m.scope === scope && m.scopeId === scopeId
    );
  }
}
