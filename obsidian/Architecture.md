---
title: "System Architecture Specification"
type: "architecture"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "architecture"
  - "design"
  - "concurrency"
  - "security"
aliases:
  - "System Architecture"
  - "Canonical Architecture"
links:
  - "[[Home]]"
  - "[[Project Overview]]"
  - "[[Problems & Solutions]]"
  - "[[Features/Index]]"
confidence: "high"
---

# System Architecture Specification

## 1. Overview & Canonical Design Principles

The **Jules Ecosystem** (Version 4.0 Canonical Architecture) is designed as a **Jules-first autonomous software engineering platform**.

### Core Architecture Principle
> **Jules is the primary intelligence. The products are independent clients. The deterministic infrastructure controls execution.**

The LLM decides *what to solve* and *how to write code*.
The platform infrastructure decides *permissions*, *sandboxing*, *verification*, *budgets*, and *merge policies*.

---

## 2. Product Relationship & Independence Boundary

The ecosystem comprises three independent products that share common SDKs, protocols, and deterministic platform backend services, but do **not** depend on each other:

```text
                         JULES ECOSYSTEM
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
 ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
 │ JULES EXTENSION │  │   JULES IDE     │  │ JULES CODE CLI  │
 │                 │  │                 │  │                 │
 │ Existing IDE    │  │ Standalone      │  │ Terminal-first  │
 │ integration     │  │ AI coding IDE   │  │ coding agent    │
 └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
                    SHARED PROTOCOLS/LIBRARIES
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
      Jules SDK          Agent Protocol       Core Tooling
      Git Engine         Task Protocol        Verification
      Security           Context              Sandbox
      GitHub             Artifacts            Policies
                               │
                               ▼
                         GOOGLE JULES
```

### The Product Independence Rule
The three products must be:
- **Independently installable**
- **Independently runnable**
- **Independently testable**
- **Independently versioned**
- **Independently deployable**

No client product depends on another client product. The legacy "Agent OS" concept was permanently removed in Version 4.0.

---

## 3. Module Dependency Graph (ASCII)

Below is the complete architectural dependency graph of the platform core (`server/`), showing the direction of flow from external clients down to persistence and external providers:

```text
                  [ CLIENT LAYER ]
    ┌────────────────────┬────────────────────┐
    │ VS Code Extension  │  Jules Code CLI    │
    └─────────┬──────────┴──────────┬─────────┘
              │ (HTTP / WebSocket)  │
              ▼                     ▼
     ┌───────────────────────────────────┐
     │      REST Gateway API             │
     │      (/api/v1/tasks, /merge)     │
     └─────────────────┬─────────────────┘
                       │
     ┌─────────────────┴─────────────────┐
     │    WebSocket Event Stream Server  │
     │    (/events)                      │
     └─────────────────┬─────────────────┘
                       │
               [ CONTROL PLANE ]
                       │
     ┌─────────────────┼─────────────────┐
     │                 │                 │
     ▼                 ▼                 ▼
┌──────────────┐  ┌───────────┐  ┌──────────────┐
│ Command Bus  │  │ DAG       │  │ Workflow     │
│ (State Tx)   │  │ Scheduler │  │ Step Engine  │
└──────┬───────┘  └─────┬─────┘  └──────┬───────┘
       │                │               │
       └────────────────┼───────────────┘
                        │
                        ▼
      ┌──────────────────────────────────┐
      │   Sandboxed Execution Broker     │
      │   - Risk Engine                  │
      │   - Policy Engine                │
      │   - Budget Manager               │
      └─────────────────┬────────────────┘
                        │
      ┌─────────────────┼─────────────────┐
      │                 │                 │
      ▼                 ▼                 ▼
┌──────────────┐  ┌───────────┐  ┌──────────────┐
│ Verification │  │ Merge     │  │ Context      │
│ Engine       │  │ Coord     │  │ Engine       │
│ (Build/Test) │  │ (Git/PR)  │  │ (Memory)     │
└──────┬───────┘  └─────┬─────┘  └──────┬───────┘
       │                │               │
       └────────────────┼───────────────┘
                        │
               [ PERSISTENCE LAYER ]
                        │
                        ▼
       ┌─────────────────────────────────┐
       │   Better-SQLite3 Database       │
       │   (WAL Mode, Foreign Keys ON)   │
       │   - Tasks, Attempts, Executions │
       │   - Outbox, Inbox, Leases       │
       │   - Context Memory, Audit Logs  │
       └─────────────────────────────────┘
```

---

## 4. End-to-End Request Flows

### Flow 1: Task Execution & Bounded Agent Loop

```text
USER / CLIENT           REST API            COMMAND BUS            EXECUTION BROKER            POLICY ENGINE
    │                      │                     │                         │                         │
    │  POST /tasks        │                     │                         │                         │
    ├─────────────────────►                     │                         │                         │
    │                      │  executeCommand()   │                         │                         │
    │                      ├────────────────────►│                         │                         │
    │                      │                     │  INSERT task (CREATED)  │                         │
    │                      │                     ├────────────────────────►│                         │
    │                      │                     │                         │                         │
    │  Task Created        │                     │                         │                         │
    ◄──────────────────────┤                     │                         │                         │
    │                      │                     │                         │                         │
    │                      │  executeTool()      │                         │                         │
    │                      │─────────────────────┼────────────────────────►│                         │
    │                      │                     │                         │  evaluate(tool, args)   │
    │                      │                     │                         ├────────────────────────►│
    │                      │                     │                         │                         │
    │                      │                     │                         │  ALLOW / DENY           │
    │                      │                     │                         ◄─────────────────────────┤
    │                      │                     │                         │                         │
    │                      │                     │                         │  checkBudget()          │
    │                      │                     │                         ├──────────────┐          │
    │                      │                     │                         │              │          │
    │                      │                     │                         ◄──────────────┘          │
    │                      │                     │                         │                         │
    │                      │                     │                         │  execute sub-process    │
    │                      │                     │                         ├──────────────┐          │
    │                      │                     │                         │              │          │
    │                      │                     │                         ◄──────────────┘          │
    │                      │                     │                         │                         │
    │                      │                     │                         │  redactSecrets(output)  │
    │                      │                     │                         ├──────────────┐          │
    │                      │                     │                         │              │          │
    │                      │                     │                         ◄──────────────┘          │
    │                      │                     │  ToolResult             │                         │
    │                      ◄─────────────────────┴─────────────────────────┤                         │
```

### Flow 2: Automated Verification & Merge Evaluation

```text
CLIENT               API GATEWAY            MERGE COORDINATOR            GIT MANAGER          VERIFICATION ENGINE
  │                       │                         │                         │                        │
  │ POST /tasks/:id/merge │                         │                         │                        │
  ├──────────────────────►│                         │                         │                        │
  │                       │ evaluateMerge()         │                         │                        │
  │                       ├────────────────────────►│                         │                        │
  │                       │                         │ validateBaseCommit()    │                        │
  │                       │                         ├────────────────────────►│                        │
  │                       │                         │ HEAD == base ?          │                        │
  │                       │                         ◄─────────────────────────┤                        │
  │                       │                         │                         │                        │
  │                       │                         │ classifyRisk() & Policy │                        │
  │                       │                         ├──────────────┐          │                        │
  │                       │                         │              │          │                        │
  │                       │                         ◄──────────────┘          │                        │
  │                       │                         │                         │                        │
  │                       │                         │ verifyClaims()          │                        │
  │                       │                         ├─────────────────────────────────────────────────►│
  │                       │                         │                         │                        │  exec('npm run build')
  │                       │                         │                         │                        ├─────────────┐
  │                       │                         │                         │                        │             │
  │                       │                         │                         │                        ◄─────────────┘
  │                       │                         │                         │                        │  exec('npm test')
  │                       │                         │                         │                        ├─────────────┐
  │                       │                         │                         │                        │             │
  │                       │                         │                         │                        ◄─────────────┘
  │                       │                         │ Evidence Results        │                        │
  │                       │                         ◄──────────────────────────────────────────────────┤
  │                       │ MergeResult             │                         │                        │
  │                       ◄─────────────────────────┤                         │                        │
```

---

## 5. Key Design Decisions

### 1. Permanent Removal of "Agent OS"
The project does **not** attempt to replace the host operating system, shell, kernel, or filesystem. Jules Code CLI is a terminal coding agent runtime, Jules IDE is a desktop coding application, and Jules Extension is a VS Code extension integration.

### 2. Bounded Autonomous Loop
Every autonomous agent operation is explicitly bounded by:
- `maxRuntimeSec` (default 3600s)
- `maxToolCalls` (default 100 calls)
- `maxCostUsd` (default $10.00)
- `maxRetries` (default 3 retries)

### 3. Independent Verification over Agent Claims
The platform never accepts an agent claim that "tests pass" or "build succeeded". All code claims must be independently executed in a sandboxed environment (`npm run build`, `npm test`) by the `VerificationEngine` before merge.

### 4. Zero Trust Policy Boundary
Repository content (source files, READMEs, PR comments, issue descriptions) is treated as untrusted data. Untrusted repository content can **never** override system policy or bypass execution broker boundaries.

---

## 6. Concurrency Model & Thread Safety

Node.js runs as a single-threaded event loop, but concurrent async operations (multiple agent workers, WebSocket clients, and REST requests) require strict data safety and isolation mechanisms:

### 1. SQLite Write-Ahead Logging (WAL) Mode
The persistence layer (`server/persistence/database.ts`) enables SQLite WAL mode and foreign key constraints:
```typescript
this.db.pragma('journal_mode = WAL');
this.db.pragma('foreign_keys = ON');
```
This enables concurrent read operations while maintaining strict serializable isolation for atomic write transactions.

### 2. Monotonic Lease Fencing
To prevent crashed or stale background workers from overwriting newer state, the `LeaseManager` (`server/execution/leases.ts`) uses **monotonically increasing fencing tokens**:
- When acquiring or renewing a lease on a resource, the `fencing_token` is incremented.
- Database writes check that `fencing_token` matches current HEAD.
- Stale worker writes with expired or lower fencing tokens are rejected.

### 3. Transactional Outbox & Inbox
Inter-service events are published atomically inside the same SQLite database transaction as domain entity state changes (`server/events/outbox.ts`).
Consumers maintain idempotency via the `inbox` table, preventing duplicate execution of side-effects upon network retries.

---

## 7. Related Notes
- [[Project Overview]] — Tech stack and component line counts.
- [[Problems & Solutions]] — Failure modes, FMEA, and troubleshooting.
- [[Features/Security]] — Zero Trust policy engine and execution broker.
- [[Features/Execution & Leases]] — Lease fencing and budget enforcement.
