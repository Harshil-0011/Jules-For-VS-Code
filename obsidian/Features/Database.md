---
title: "Database & Persistence"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "database"
  - "sqlite"
  - "migrations"
  - "persistence"
aliases:
  - "Database"
  - "Persistence Layer"
  - "SQLite Database"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Features/Configuration]]"
  - "[[Memory System]]"
confidence: "high"
---

# Database & Persistence Feature Specification

## 1. System Overview

The **Database & Persistence** subsystem provides durable relational state management for the platform (`server/persistence/database.ts`).

Powered by **`better-sqlite3`**, the system operates in Write-Ahead Logging (WAL) mode with explicit foreign key enforcement, providing thread-safe synchronous database operations and ACID-compliant transactional guarantees.

---

## 2. Key Components

1. **`DatabaseService`** (`server/persistence/database.ts`):
   - Manages SQLite connection lifecycle, PRAGMA setup (`journal_mode = WAL`, `foreign_keys = ON`), and automatic schema migration execution.
2. **Schema Migration Engine (`migrate`)**:
   - Executes DDL migration statements on startup to construct platform tables if they do not exist.
3. **Database Relational Schema**:
   - Primary tables: `schema_migrations`, `tenants`, `tasks`, `task_dependencies`, `attempts`, `executions`, `outbox`, `inbox`, `leases`, `evidence`, `audit_logs`, `context_memory`, `workflow_steps`.

---

## 3. Database Schema Entity Relationship Diagram

```text
       ┌──────────────┐             ┌──────────────┐
       │   tenants    │1           *│    tasks     │
       │──────────────┼────────────►│──────────────│
       │ id (PK)      │             │ id (PK)      │
       │ name         │             │ tenant_id(FK)│
       └──────────────┘             │ status       │
                                    └──────┬───────┘
                                           │1
                                           │
                                           │*
                                    ┌──────▼───────┐
                                    │   attempts   │
                                    │──────────────│
                                    │ id (PK)      │
                                    │ task_id (FK) │
                                    └──────┬───────┘
                                           │1
                                           │
                                           │*
                                    ┌──────▼───────┐
                                    │  executions  │
                                    │──────────────│
                                    │ id (PK)      │
                                    │attempt_id(FK)│
                                    └──────────────┘
```

---

## 4. Subsystem Configuration

Managed via Zod configuration schema (`server/api/config.ts`):

| Config Field | Environment Variable | Default Value | Description |
|---|---|---|---|
| `dbPath` | `DB_PATH` | `./jules_platform.db` | File path to SQLite database. Use `:memory:` for ephemeral unit tests. |

---

## 5. Table Inventory & Indexing Strategy

- **`tasks`**: Stores primary task entities, titles, risk levels, budgets, and statuses.
- **`outbox`**: Stores pending transactional events (`status = 'PENDING'`). Indexed by `status` and `created_at`.
- **`inbox`**: Stores processed event IDs per consumer for deduplication. Primary key on `(event_id, consumer)`.
- **`leases`**: Stores resource leases and monotonic fencing tokens. Primary key on `resource_id`.
- **`context_memory`**: Stores multi-scope context key-value pairs and provenance JSON. Primary key on `id`.

---

## 6. Known Issues & Edge Cases

1. **Concurrent File Access across Processes**: While SQLite WAL mode supports multiple readers, writing from multiple OS processes simultaneously can produce `SQLITE_BUSY` errors. All writes must route through the platform backend service.
2. **In-Memory Testing Database Isolation**: When using `:memory:` in Jest tests, each `DatabaseService` instance creates an isolated database that is destroyed when closed.

---

## 7. Related Notes
- [[Memory System]] — Detailed specification of `context_memory` table and Context Engine.
- [[Features/API & WebSocket Server]] — Outbox and Inbox event persistence patterns.
- [[Features/Execution & Leases]] — Lease fencing table state management.
