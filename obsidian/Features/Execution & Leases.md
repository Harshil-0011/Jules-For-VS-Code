---
title: "Execution & Leases"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "execution"
  - "leases"
  - "budgets"
  - "fencing"
aliases:
  - "Execution & Leases"
  - "Lease Fencing"
  - "Budget Manager"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Features/Security]]"
  - "[[Features/Task & Queue Management]]"
confidence: "high"
---

# Execution & Leases Feature Specification

## 1. System Overview

The **Execution & Leases** subsystem manages sandboxed command dispatch, multi-level budget constraints, atomic lease acquisition, and monotonic fencing tokens (`server/execution/execution_broker.ts`, `server/execution/leases.ts`, `server/budgets/budget_manager.ts`).

It prevents split-brain writes from crashed or delayed workers, enforces runtime budget caps, and provides safe execution boundaries for shell operations.

---

## 2. Key Components

1. **`LeaseManager`** (`server/execution/leases.ts`):
   - **`acquireLease(resourceId, ownerId, ttlMs)`**: Atomically acquires or renews a lease in SQLite, incrementing `fencing_token`.
   - **`renewLease(resourceId, ownerId, fencingToken, ttlMs)`**: Extends lease expiry if `fencing_token` matches current HEAD token.
   - **Monotonic Fencing Tokens**: Ensures stale worker writes with outdated fencing tokens are rejected.
2. **`BudgetManager`** (`server/budgets/budget_manager.ts`):
   - Tracks resource usage per task (`runtimeSec`, `toolCalls`, `costUsd`, `retries`).
   - **`checkBudget(taskId, budget)`**: Validates usage against constraints before permitting tool operations.
   - **`recordUsage(taskId, runtimeSec, toolCalls, costUsd)`**: Increments usage metrics upon tool call completion.
3. **`ExecutionBroker`** (`server/execution/execution_broker.ts`):
   - Executes tools under policy checks, budget constraints, emergency stop state, and secret redaction.

---

## 3. Lease Fencing & Tool Execution Flow Diagram

```text
WORKER PROCESS              LEASE MANAGER             BUDGET MANAGER            EXECUTION BROKER
      │                           │                          │                          │
      │ acquireLease(resId, owner)│                          │                          │
      ├──────────────────────────►│                          │                          │
      │                           │ Increment fencing_token  │                          │
      │                           │ INSERT/UPDATE leases     │                          │
      │                           ├──────────────┐           │                          │
      │                           │              │           │                          │
      │                           ◄──────────────┘           │                          │
      │ Lease {fencingToken}      │                          │                          │
      ◄───────────────────────────┤                          │                          │
      │                           │                          │                          │
      │ executeTool(req)          │                          │                          │
      ├─────────────────────────────────────────────────────►│                          │
      │                           │                          │ checkBudget(taskId)      │
      │                           │                          ├──────────────┐           │
      │                           │                          │              │           │
      │                           │                          ◄──────────────┘           │
      │                           │                          │                          │
      │                           │                          │ executeTool()            │
      │                           │                          ├─────────────────────────►│
      │                           │                          │                          │ Enforce Policy
      │                           │                          │                          │ Secret Redaction
      │                           │                          │ Tool Result              │
      │ Tool Output               │                          ◄──────────────────────────┤
      ◄───────────────────────────┴──────────────────────────┤                          │
```

---

## 4. Subsystem Budget Metrics & Thresholds

| Budget Metric | Default Constraint | Action on Exceeding |
|---|---|---|
| `maxRuntimeSec` | `3600` seconds (1 hr) | Rejects tool call with `BUDGET_EXCEEDED: Maximum runtime exceeded`. |
| `maxToolCalls` | `100` calls | Rejects tool call with `BUDGET_EXCEEDED: Maximum tool calls exceeded`. |
| `maxCostUsd` | `$10.00` USD | Rejects tool call with `BUDGET_EXCEEDED: Maximum cost limit reached`. |
| `maxRetries` | `3` retries | Transitions task step to `ESCALATE`. |

---

## 5. Known Issues & Edge Cases

1. **Stale Lease Eviction Delay**: If a worker process crashes without releasing its lease, the resource remains locked until `expires_at` timestamp passes.
2. **Clock Skew in Distributed Workers**: Database server time (`CURRENT_TIMESTAMP`) is used as the authority for lease expirations to prevent host clock drift issues.

---

## 6. Related Notes
- [[Features/Security]] — Zero Trust policy enforcement and secret redaction.
- [[Features/Task & Queue Management]] — Task budget definitions and models.
- [[Features/Database]] — `leases` database schema table.
