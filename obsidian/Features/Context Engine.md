---
title: "Context Engine"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "context"
  - "memory"
  - "provenance"
aliases:
  - "Context Engine"
  - "Context Memory"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Memory System]]"
  - "[[Features/Database]]"
confidence: "high"
---

# Context Engine Feature Specification

## 1. System Overview

The **Context Engine** subsystem manages multi-scope project memory, workspace context discovery, decision tracking, and context prompt augmentation (`server/context/context_engine.ts`).

By persisting structured memory records in SQLite, it enables autonomous agents to retrieve past architectural decisions, repository conventions, and sub-task findings across sessions.

---

## 2. Key Components

1. **`ContextEngine` Class** (`server/context/context_engine.ts`):
   - Initializes `context_memory` table in SQLite.
   - Operates synchronous `store(item)` and `query(scope, scopeId)` methods.
2. **`MemoryItem` Data Interface**:
   - Represents typed memory items (`id`, `scope`, `scopeId`, `key`, `value`, `provenance`).
   - Supports scopes: `GLOBAL`, `PROJECT`, `TASK`.
3. **Provenance Metadata**:
   - Captures metadata (`sourceTaskId`, `agentId`, `timestamp`) for complete auditability.

---

## 3. Store & Query Flow Diagram

```text
CALLER / SUB-AGENT            CONTEXT ENGINE             SQLITE DATABASE
        │                           │                           │
        │ store(memoryItem)         │                           │
        ├──────────────────────────►│                           │
        │                           │ INSERT OR REPLACE INTO    │
        │                           │ context_memory            │
        │                           ├──────────────────────────►│
        │                           │                           │ Item Persisted
        │                           ◄───────────────────────────┤
        │                           │                           │
        │ query(scope, scopeId)     │                           │
        ├──────────────────────────►│                           │
        │                           │ SELECT FROM context_memory│
        │                           │ WHERE scope=? AND id=?    │
        │                           ├──────────────────────────►│
        │                           │                           │ Rows Returned
        │                           ◄───────────────────────────┤
        │                           │                           │
        │                           │ Parse provenance JSON     │
        │                           ├──────────────┐            │
        │                           │              │            │
        │                           ◄──────────────┘            │
        │ MemoryItem[] Array        │                           │
        ◄───────────────────────────┤                           │
```

---

## 4. Subsystem Memory Scope Reference

| Memory Scope | Scope ID Value | Typical Memory Items Stored |
|---|---|---|
| `GLOBAL` | `global` / Tenant ID | User coding styles, global security permissions, default tool settings. |
| `PROJECT` | `default-project` / Repo Name | Build commands (`npm run build`), test commands, framework conventions. |
| `TASK` | Task UUID (e.g. `task-123`) | Sub-task inspection findings, plan state, temporary variables. |

---

## 5. Known Issues & Edge Cases

1. **Key Collisions within Scope**: Storing a duplicate key within the same scope and scope ID overwrites the previous value (`INSERT OR REPLACE`).
2. **Provenance JSON Parsing**: If raw provenance JSON in `context_memory` becomes corrupted, `query()` catches JSON syntax errors and returns empty provenance objects.

---

## 6. Related Notes
- [[Memory System]] — Full specification of the platform memory system architecture.
- [[Features/Database]] — SQLite persistence and `context_memory` schema.
- [[Features/LLM Integration]] — Prompt augmentation with retrieved context memory.
