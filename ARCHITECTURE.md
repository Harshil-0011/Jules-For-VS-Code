# System Architecture & Design Specification

## 1. Core Priority Hierarchy
When design choices, performance optimizations, or operational tradeoffs conflict, system decisions MUST strictly follow this priority hierarchy:

```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

1. **CORRECTNESS**: System behavior and state transitions must always be deterministic, accurate, and consistent.
2. **SAFETY**: Operations must prevent unauthorized host execution, prompt injection exploits, credential leaks, and data corruption.
3. **VERIFIABILITY**: Claims made by agents ("tests pass", "build succeeds") must be independently re-executed and verified with cryptographic/durable evidence.
4. **RELIABILITY**: Workflows and tasks must survive worker crashes, provider outages, and network interruptions using durable lease fencing and transactional outboxes.
5. **RECOVERABILITY**: The control plane must be able to resume state or compensate failed operations after system restarts or unexpected failures.
6. **PERFORMANCE**: Latency and resource efficiency are optimized only after correctness, safety, verifiability, reliability, and recoverability are guaranteed.
7. **COST**: Resource utilization (API tokens, compute) is controlled via budgets, but never at the expense of safety or correctness.
8. **SPEED**: Execution velocity is the lowest priority; safety gates and verification checks are never bypassed for speed.

---

## 2. Primary User Interaction Surfaces
The Google Jules platform provides three primary user interaction surfaces:

1. **VS Code Extension**: Native visual interface integrating directly with VS Code sidebar, task lists, agent team panel, evidence logs, approval notifications, and emergency stop control.
2. **Coding IDE Interface**: Web-based/embedded IDE dashboard for managing workflows, visualizing task DAGs, reviewing code changes, and monitoring multi-agent executions.
3. **Coding CLI / Agent OS Shell**: Command-line interface and terminal shell tool enabling developers and CI/CD pipelines to trigger tasks, monitor agent activities, inspect evidence graphs, and administer control plane policies.

---

## 3. High-Level Architecture Overview

```text
 ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
 │    VS CODE EXTENSION    │  │   CODING IDE INTERFACE  │  │   CODING CLI / SHELL    │
 └────────────┬────────────┘  └────────────┬────────────┘  └────────────┬────────────┘
              │                            │                            │
              └────────────────────────────┼────────────────────────────┘
                                           │ HTTPS / WebSockets
                                           ▼
                              ┌─────────────────────────┐
                              │       API GATEWAY       │
                              │                         │
                              │ Auth & Tenancy          │
                              │ Request Routing         │
                              │ WebSocket Event Stream  │
                              └────────────┬────────────┘
                                           │
  ┌────────────────────────────────────────┼────────────────────────────────────────┐
  ▼                                        ▼                                        ▼
COMMAND BUS                            CONTROL PLANE                       EVENT BUS (OUTBOX)
  │                            (Tasks, Workflows, Scheduler,                        │
  │                             Teams, Policies, Budgets)                           │
  └────────────────────────────────────────┬────────────────────────────────────────┘
                                           │
                                           ▼
                                    EXECUTION BROKER
                                           │
           ┌───────────────────────────────┼───────────────────────────────┐
           ▼                               ▼                               ▼
       SANDBOX                       JULES ADAPTER                    GIT / GITHUB
   (Isolated Tools)                  (Jules API)                  (Isolation & PRs)
           │                               │                               │
           └───────────────────────────────┼───────────────────────────────┘
                                           ▼
                                  VERIFICATION ENGINE
                                           │
                                           ▼
                                    EVIDENCE GRAPH
                                           │
                                           ▼
                                  MERGE COORDINATOR
```

---

## 4. Bounded Contexts

1. **Auth & Tenancy**: Workspace & user identity verification, RBAC, JWT validation, and multi-tenant isolation.
2. **Task & Workflow Engine**: Durable Task DAGs, Attempts, Executions, Workflow State Machines, Idempotent Commands, Transactional Outbox/Inbox.
3. **Agent Management & Multi-Agent Teams**: `AgentRegistry`, Capability matching, `JulesAdapter`, heterogeneous Provider Adapters, Team Orchestrator.
4. **Execution & Sandboxing**: Sandboxed Execution Broker, Tool Broker, File/Process/Network Isolation, Emergency Stop.
5. **Policy & Governance**: Declarative Policy Engine, Risk Engine (LOW, MEDIUM, HIGH, CRITICAL), Multi-level Budget Manager, Approval Gates.
6. **Git & Verification**: Git Isolation Manager, GitHub Provider, Independent Verification Engine, Evidence Graph, Merge Coordinator.
7. **Memory & Context**: Multilevel Context Engine (Global, Project, Task), Provenance-aware Memory, Search/Retrieval.
8. **Audit & Observability**: Transactional Outbox, Structured JSON Auditing, Correlation Tracking, Metrics, WebSocket Event Streaming.

---

## 5. Authoritative State Ownership

To prevent LLMs or ephemeral processes from acting as sources of state truth:

- **Control Plane DB (PostgreSQL / SQLite)**: Authoritative for Tasks, Task Dependencies, Attempts, Executions, Teams, Policies, Budgets, Approvals, Workflow States, Outbox/Inbox, and Lease Fencing Tokens.
- **Jules / Provider API**: Authoritative for Provider Session State & Activity logs.
- **Git Repository**: Authoritative for Source Commit History, Trees, Workspaces, and Patch Diffs.
- **GitHub**: Authoritative for Remote Repositories, Pull Requests, and Remote Code Review State.
- **Verification Engine**: Authoritative for Verification Executions, Pass/Fail Evidence, and Security Reports.

---

## 6. Lifecycles & State Machines

### Task Lifecycle
`CREATED` → `PENDING_DEPENDENCIES` → `READY` → `SCHEDULED` → `RUNNING` → `VERIFYING` → `AWAITING_APPROVAL` → `COMPLETED` / `FAILED` / `CANCELLED`

### Workflow Step Lifecycle
`PRECONDITION_CHECK` → `EXECUTE` → `VERIFY` → `EVALUATE_POLICY` → `COMPLETE` (or `RETRY` / `COMPENSATE` / `ESCALATE`)

### Agent Attempt Lifecycle
`ASSIGNED` → `WORKSPACE_PROVISIONED` → `SESSION_ACTIVE` → `EXECUTING_TOOLS` → `CHANGES_SUBMITTED` → `RECONCILED` → `TERMINATED`

---

## 7. Security Invariants
1. **Trust Hierarchy**: System Policy > User Intent > Orchestrator Policy > Agent Role > Repository Content. Repository files can NEVER override platform policies.
2. **No Stale Worker Writes**: Monotonically increasing fencing tokens on leases reject expired worker updates.
3. **Independent Verification**: Agent claims ("tests pass") are independently executed and verified before merge.
4. **Zero Trust Tool Execution**: Tool execution passes through the Execution Broker with secret redaction and resource limits.
5. **Emergency Stop**: Instantly halts all active tasks, tool executions, and merges across all workers.
