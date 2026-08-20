---
title: "Task & Queue Management"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "tasks"
  - "queue"
  - "command-bus"
  - "priority"
aliases:
  - "Task Management"
  - "Queue Management"
  - "Priority Queue"
  - "Command Bus"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Features/Scheduler]]"
  - "[[Features/Execution & Leases]]"
confidence: "high"
---

# Task & Queue Management Feature Specification

## 1. System Overview

The **Task & Queue Management** subsystem provides durable task state models, priority-based task scheduling, fair multi-tenant queue allocation, and transactional command dispatch (`server/tasks/models.ts`, `server/queues/queue_manager.ts`, `server/commands/command_bus.ts`).

It defines the core domain models (`Task`, `Attempt`, `Execution`, `Artifact`, `Evidence`, `Decision`) and manages state transitions through the `CommandBus`.

---

## 2. Key Components

1. **Task Models & Domain Interfaces** (`server/tasks/models.ts`):
   - **`Task`**: Primary task entity (`id`, `tenantId`, `title`, `description`, `status`, `riskLevel`, `budget`, `dependencies`).
   - **`Attempt`**: Execution attempt history per task (`attemptNumber`, `status`).
   - **`Execution`**: Specific agent session execution within an attempt (`agentId`, `startedAt`, `completedAt`).
   - **`Evidence`**: Independent verification claim evidence (`claim`, `status`, `details`).
2. **`PriorityQueueManager`** (`server/queues/queue_manager.ts`):
   - Priority queue sorting tasks based on weighted score:
     $$\text{Score} = (\text{RiskWeight}) + (\text{AgeInSeconds} \times 0.1) - (\text{TenantActiveTasks} \times 5)$$
   - Ensures high-priority tasks run quickly while preventing single-tenant queue starvation.
3. **`CommandBus`** (`server/commands/command_bus.ts`):
   - Transactional command executor enforcing atomic state changes (`CREATE_TASK`, `START_TASK`, `CANCEL_TASK`) and publishing outbox events.

---

## 3. Command Execution & Queue Flow Diagram

```text
CLIENT / CALLER               COMMAND BUS             PERSISTENCE DB            PRIORITY QUEUE
       │                           │                         │                          │
       │ executeCommand(type, payload)                       │                          │
       ├──────────────────────────►│                         │                          │
       │                           │ BEGIN TRANSACTION       │                          │
       │                           ├────────────────────────►│                          │
       │                           │                         │                          │
       │                           │ UPDATE task status      │                          │
       │                           ├────────────────────────►│                          │
       │                           │                         │                          │
       │                           │ INSERT outbox event     │                          │
       │                           ├────────────────────────►│                          │
       │                           │                         │                          │
       │                           │ COMMIT TRANSACTION      │                          │
       │                           ├────────────────────────►│                          │
       │                           │                         │                          │
       │                           │ enqueueTask(task)       │                          │
       │                           ├───────────────────────────────────────────────────►│
       │                           │                         │                          │ Calculate Score
       │                           │                         │                          ├──────────────┐
       │                           │                         │                          │ Re-sort Queue│
       │                           │                         │                          ◄──────────────┘
       │ Command Result            │                         │                          │
       ◄───────────────────────────┤                         │                          │
```

---

## 4. Subsystem Risk Weights & Scoring Rules

The `PriorityQueueManager` applies risk level weights when computing priority scores:

| Risk Level | Weight Points | Purpose |
|---|---|---|
| `CRITICAL` | `100` | Process critical security or emergency tasks immediately. |
| `HIGH` | `50` | Prioritize high-risk bug fixes and structural refactors. |
| `MEDIUM` | `20` | Normal priority feature additions. |
| `LOW` | `10` | Low priority documentation updates and refactoring. |

---

## 5. Known Issues & Edge Cases

1. **Queue Re-Sorting Overhead**: Under heavy task submission, frequent array re-sorting on enqueue can degrade queue throughput; managed by maintaining pre-sorted min-heap priority queues.
2. **Duplicate Command Execution**: Handled by transactional outbox publishing and idempotency key checking in the database.

---

## 6. Related Notes
- [[Features/Scheduler]] — Topological DAG scheduling and state machine logic.
- [[Features/Execution & Leases]] — Sandboxed tool execution and budget management.
- [[Features/API & WebSocket Server]] — Outbox event publishing upon command completion.
