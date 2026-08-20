---
title: "Scheduler & Workflow Engine"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "scheduler"
  - "dag"
  - "workflow"
  - "state-machine"
aliases:
  - "Scheduler"
  - "DAG Scheduler"
  - "Workflow Engine"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Features/Task & Queue Management]]"
  - "[[Features/Execution & Leases]]"
confidence: "high"
---

# Scheduler & Workflow Engine Feature Specification

## 1. System Overview

The **Scheduler & Workflow Engine** subsystem manages task dependency resolution, topological ordering, cycle detection, failure propagation, and workflow step state machine execution (`server/scheduler/dag.ts`, `server/workflows/workflow_engine.ts`).

It ensures tasks run strictly after their pre-requisites are satisfied, prevents deadlocks from circular dependencies, and manages workflow step retries and compensations.

---

## 2. Key Components

1. **`DAGScheduler`** (`server/scheduler/dag.ts`):
   - **`detectCycle(tasks)`**: Depth-First Search (DFS) cycle detector using recursion stack tracking. Returns `true` if circular task dependencies exist.
   - **`getReadyTasks(tasks)`**: Filters tasks whose parent dependencies are all in `COMPLETED` status.
   - **`propagateFailures(tasks)`**: Iteratively cascades `CANCELLED` status to downstream tasks if any dependency fails, cancels, or blocks.
2. **`WorkflowEngine`** (`server/workflows/workflow_engine.ts`):
   - Manages step state transitions: `PRECONDITION_CHECK` → `EXECUTE` → `VERIFY` → `EVALUATE_POLICY` → `COMPLETE`.
   - Tracks retries (`retryCount`, `maxRetries`); escalates step state to `ESCALATE` when retries are exhausted.

---

## 3. Workflow Step State Machine Flow Diagram

```text
               ┌────────────────────────┐
               │   PRECONDITION_CHECK   │
               └───────────┬────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │    EXECUTE    │
                   └───────┬───────┘
                           │
                           ▼
                   ┌───────────────┐
                   │    VERIFY     │
                   └───────┬───────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
         Success                       Failure
            │                             │
            ▼                             ▼
   ┌────────────────┐             ┌───────────────┐
   │ EVALUATE_POLICY│             │     RETRY     │
   └────────┬───────┘             └───────┬───────┘
            │                             │
            ▼                       ┌─────┴─────┐
   ┌────────────────┐          retry <= 3    retry > 3
   │    COMPLETE    │               │           │
   └────────────────┘               ▼           ▼
                            ┌───────────┐ ┌───────────┐
                            │  EXECUTE  │ │ ESCALATE  │
                            └───────────┘ └───────────┘
```

---

## 4. Subsystem Configuration

Workflow steps configure default retry limits and timeouts upon creation:

| Setting | Default Value | Description |
|---|---|---|
| `maxRetries` | `3` | Maximum retry attempts for failed workflow steps before escalating. |
| `timeoutMs` | `30000` (30s) | Step execution timeout ceiling in milliseconds. |

---

## 5. Task Status State Transitions

Tasks progress through formal status states (`TaskStatus`):

```text
CREATED ──► PENDING_DEPENDENCIES ──► READY ──► SCHEDULED ──► RUNNING ──► VERIFYING ──► COMPLETED
  │                                                                 │
  └──────────────────────────────► CANCELLED / FAILED ──────────────┴──► AWAITING_APPROVAL
```

---

## 6. Known Issues & Edge Cases

1. **Circular Dependency Deadlocks**: If a task graph contains a cycle, `DAGScheduler.detectCycle()` flags the condition and halts execution before scheduling.
2. **Iterative Failure Cascade Overhead**: Deeply nested task graphs execute multiple DFS passes in `propagateFailures()` until no state changes occur.

---

## 7. Related Notes
- [[Features/Task & Queue Management]] — Task lifecycle models and Priority Queue sorting.
- [[Features/Execution & Leases]] — Lease fencing and budget limits during step execution.
- [[Features/Verification & Merge Engine]] — Verification step state checking.
