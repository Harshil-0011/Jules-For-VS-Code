# Final System Architecture

## 1. System Goals & Non-Goals
### Goals
- **Google Jules First**: Google Jules is the primary default autonomous coding agent.
- **Provider Extensibility**: Heterogeneous AI agents (Gemini, Claude, Codex, Local Models, Custom HTTP agents) can be registered via `AgentProvider` adapters.
- **Multi-Agent Teams**: Support teams of concurrent Jules and non-Jules agents assigned to distinct DAG tasks.
- **Deterministic Orchestration**: LLMs decide solutions; the deterministic control plane decides permission, task DAG status, verification success, and merge policy.
- **Durable Orchestration**: Task state, workflow state, leases, outbox events, and evidence survive server/worker crashes.
- **Git Safety**: Agents operate in isolated Git branches/workspaces; stale base commits are strictly rejected.
- **Independent Verification**: Agent claims ("tests pass") are independently executed and verified before merge.
- **VS Code Native**: Complete user interaction occurs through a native VS Code extension connected via HTTPS/WebSocket.

### Non-Goals
- Unrestricted host tool execution.
- Arbitrary LLM-controlled system state updates.
- Microservice complexity prior to necessity (server is a modular monolith).

## 2. System Context & Bounded Contexts
```
               ┌─────────────────────────┐
               │         VS CODE         │
               │ Extension Interface     │
               └────────────┬────────────┘
                            │ HTTPS / WS
                            ▼
               ┌─────────────────────────┐
               │      API GATEWAY        │
               └────────────┬────────────┘
                            │
  ┌─────────────────────────┼─────────────────────────┐
  ▼                         ▼                         ▼
COMMAND BUS             CONTROL PLANE            EVENT BUS (OUTBOX)
  │              (Tasks, Workflows, Scheduler,        │
  │               Teams, Policies, Budgets)           │
  └─────────────────────────┬─────────────────────────┘
                            │
                            ▼
                   EXECUTION BROKER
                            │
      ┌─────────────────────┼─────────────────────┐
      ▼                     ▼                     ▼
  SANDBOX             JULES ADAPTER          GIT / GITHUB
  (Isolated Tools)    (Jules API)            (Isolation & PRs)
      │                     │                     │
      └─────────────────────┼─────────────────────┘
                            ▼
                   VERIFICATION ENGINE
                            │
                            ▼
                     EVIDENCE GRAPH
                            │
                            ▼
                   MERGE COORDINATOR
```

### Bounded Contexts
1. **Auth & Tenancy**: Workspace & user identity verification.
2. **Task & Workflow Engine**: Task DAGs, Attempts, Executions, Workflow State Machines.
3. **Agent Management**: `AgentRegistry`, Capabilities, `JulesAdapter`, Provider Adapters, Team Orchestrator.
4. **Execution & Sandboxing**: Tool Broker, Sandbox Runtime, Network/FS Isolation.
5. **Policy & Governance**: Policy Engine, Risk Engine, Budget Manager, Approvals, Emergency Stop.
6. **Git & Verification**: Git Isolation Manager, GitHub Provider, Verification Engine, Evidence Graph, Merge Coordinator.
7. **Memory & Context**: Multilevel Context Engine (Global, Project, Task), Provenance-aware Memory.
8. **Audit & Observability**: Transactional Outbox, Structured Auditing, Metrics, Tracing.

## 3. Authoritative State Ownership
- **Control Plane DB (PostgreSQL / Durable Storage)**: Authoritative for Tasks, Task Dependencies, Attempts, Executions, Teams, Policies, Budgets, Approvals, Workflow States, Outbox, Leases.
- **Jules / Provider API**: Authoritative for Provider Session State & Activity logs.
- **Git**: Authoritative for Repository Commit History, Trees, and Workspace file content.
- **GitHub**: Authoritative for Remote Repositories, Pull Requests, and Remote Review State.
- **Verification Engine**: Authoritative for Verification Executions, Pass/Fail Evidence, and Security Reports.

## 4. Lifecycles & State Machines
### Task Lifecycle
`CREATED` → `PENDING_DEPENDENCIES` → `READY` → `SCHEDULED` → `RUNNING` → `VERIFYING` → `AWAITING_APPROVAL` → `COMPLETED` / `FAILED` / `CANCELLED`

### Workflow Step Lifecycle
`PRECONDITION_CHECK` → `EXECUTE` → `VERIFY` → `EVALUATE_POLICY` → `COMPLETE` (or `RETRY` / `COMPENSATE` / `ESCALATE`)

### Agent Attempt Lifecycle
`ASSIGNED` → `WORKSPACE_PROVISIONED` → `SESSION_ACTIVE` → `EXECUTING_TOOLS` → `CHANGES_SUBMITTED` → `RECONCILED` → `TERMINATED`

## 5. Security & Threat Architecture
- System Security Policy > User Intent > Orchestrator Policy > Agent Role > Repository Content.
- Repository instructions can NEVER override platform security policy.
- All agent tool executions pass through sandboxed Execution Broker.
- Scoped short-lived credentials; secret redaction in all logs, events, and prompts.

## 6. System Invariants
1. No unauthorized agent action.
2. No agent can bypass policy.
3. No stale worker can mutate current state (lease fencing).
4. No task executes before dependencies are satisfied.
5. Idempotent command execution prevents duplicate work.
6. Authoritative state lives in persistent database, never in process memory.
7. Stale patches modifying changed branches are rejected.
8. No direct merges without passing merge policy and verification.
9. Every agent claim requires independent execution proof.
10. Emergency stop immediately prevents new tool executions and workflows.
