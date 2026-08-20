---
title: "Memory System Specification"
type: "memory"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "memory"
  - "context"
  - "sqlite"
  - "provenance"
aliases:
  - "Context Memory"
  - "Memory Architecture"
links:
  - "[[Home]]"
  - "[[Architecture]]"
  - "[[Features/Context Engine]]"
  - "[[Features/Database]]"
confidence: "high"
---

# Memory System Specification

## 1. Overview

The **Jules Ecosystem Memory System** is managed by the `ContextEngine` (`server/context/context_engine.ts`). It provides durable, structured context memory across agent executions, tasks, and multi-agent teams.

Rather than relying on ephemeral LLM prompt context buffers, the Memory System persists contextual items in SQLite, enabling agents to query prior architectural decisions, repository metadata, user preferences, and sub-task outcomes.

---

## 2. Multi-Scope Hierarchy

Context memory is organized hierarchically into three distinct memory scopes:

```text
                  ┌───────────────────────────────┐
                  │          GLOBAL SCOPE         │
                  │  (System-wide preferences,   │
                  │   cross-project rules)        │
                  └───────────────┬───────────────┘
                                  │
                  ┌───────────────▼───────────────┐
                  │         PROJECT SCOPE         │
                  │  (Repo conventions, build     │
                  │   commands, architecture)     │
                  └───────────────┬───────────────┘
                                  │
                  ┌───────────────▼───────────────┐
                  │           TASK SCOPE          │
                  │  (Task plans, attempt status, │
                  │   sub-agent findings)         │
                  └───────────────────────────────┘
```

### Memory Scope Definitions

1. **`GLOBAL`**:
   - Scope ID: `global` or tenant ID.
   - Purpose: Applies across all projects and tasks. Stores user preferences, default security policies, and global tool permissions.
2. **`PROJECT`**:
   - Scope ID: Repository name or project ID (e.g., `default-project`).
   - Purpose: Stores project-specific architectural guidelines, discovered package managers, build flags, and key design decisions.
3. **`TASK`**:
   - Scope ID: Task UUID (e.g., `task-123`).
   - Purpose: Stores task-specific inspection findings, temporary variables, sub-agent coordination state, and execution plans.

---

## 3. Data Model & Provenance Tracking

Every memory item stored in the system is typed via the `MemoryItem` interface:

```typescript
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
```

### Provenance Tracking
To maintain auditability and data safety, memory entries include explicit **provenance metadata**:
- `sourceTaskId`: The task during which the memory item was created or updated.
- `agentId`: The specific sub-agent or Jules adapter session that recorded the memory.
- `timestamp`: ISO-8601 timestamp of memory creation.

---

## 4. SQLite Database Schema

Memory items are persisted in the `context_memory` table within the primary SQLite database (`server/persistence/database.ts` / `server/context/context_engine.ts`):

```sql
CREATE TABLE IF NOT EXISTS context_memory (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  scope_id TEXT NOT NULL,
  memory_key TEXT NOT NULL,
  memory_value TEXT NOT NULL,
  provenance_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. ContextEngine API Operations

The `ContextEngine` exposes two primary synchronous database operations:

### 1. Storing Memory Items (`store`)
Uses `INSERT OR REPLACE` to guarantee idempotent key updates within a given scope:

```typescript
public store(item: MemoryItem): void {
  this.db.prepare(`
    INSERT OR REPLACE INTO context_memory (id, scope, scope_id, memory_key, memory_value, provenance_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    item.id,
    item.scope,
    item.scopeId,
    item.key,
    item.value,
    JSON.stringify(item.provenance)
  );
}
```

### 2. Querying Memory Scope (`query`)
Retrieves all memory records belonging to a target scope and scope ID, parsing provenance JSON:

```typescript
public query(scope: 'GLOBAL' | 'PROJECT' | 'TASK', scopeId: string): MemoryItem[] {
  const rows = this.db.prepare(`
    SELECT id, scope, scope_id as scopeId, memory_key as key, memory_value as value, provenance_json as provenanceJson
    FROM context_memory WHERE scope = ? AND scope_id = ?
  `).all(scope, scopeId) as any[];

  return rows.map((r) => ({
    id: r.id,
    scope: r.scope,
    scopeId: r.scopeId,
    key: r.key,
    value: r.value,
    provenance: JSON.parse(r.provenanceJson),
  }));
}
```

---

## 6. Integration with Jules Agent Execution

During task dispatch, the platform queries memory across all three scopes (`GLOBAL`, `PROJECT`, `TASK`) and constructs an augmented system context prompt for Google Jules:

```text
               Query GLOBAL Memory
                        │
                        ▼
               Query PROJECT Memory
                        │
                        ▼
                 Query TASK Memory
                        │
                        ▼
         Construct System Context Prompt
                        │
                        ▼
              Send to Google Jules API
```

This ensures that Jules operates with complete awareness of project standards and past sub-task findings without exceeding prompt token budgets.

---

## 7. Related Notes
- [[Architecture]] — Platform architecture and data flow.
- [[Features/Context Engine]] — Context Engine module feature specification.
- [[Features/Database]] — SQLite persistence layer specification.
