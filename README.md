# Jules Engineering Platform

> **Jules-first autonomous software engineering platform**

A production-oriented autonomous software engineering platform that puts **Google Jules at the center of a controlled multi-agent development system**.

The platform connects VS Code, Coding IDE Interface, Coding CLI / Agent OS Shell, Google Jules, GitHub, verification systems, sandboxed tools, and additional AI agents through a durable orchestration layer.

It is designed to make autonomous coding **observable, verifiable, recoverable, and policy-controlled** rather than simply giving an AI unrestricted access to a repository.

---

## Core Priority Hierarchy

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

## Primary User Interaction Surfaces

The platform supports three primary user interaction surfaces:

1. **VS Code Extension**: Native visual interface integrating directly with VS Code sidebar, task lists, agent team panel, evidence logs, approval notifications, and emergency stop control.
2. **Coding IDE Interface**: Web-based/embedded IDE dashboard for managing workflows, visualizing task DAGs, reviewing code changes, and monitoring multi-agent executions.
3. **Coding CLI / Agent OS Shell**: Command-line interface and terminal shell tool enabling developers and CI/CD pipelines to trigger tasks, monitor agent activities, inspect evidence graphs, and administer control plane policies.

---

## Architecture

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

Detailed architectural specifications are located in:
- [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`FINAL_ARCHITECTURE.md`](./FINAL_ARCHITECTURE.md)

---

## Key Features

- **Jules-first Agent Orchestration**: Jules is the default coding agent, integrated via an isolated `JulesAdapter`.
- **Multi-Agent Teams**: Coordinate teams of concurrent agents (Jules, Gemini, Claude, Codex, Local Models) assigned to DAG tasks.
- **Task DAGs & Workflows**: Represent complex engineering workloads as dependency graphs backed by durable workflows.
- **Independent Verification**: Re-executes `npm run build` and `npm test` independently before validating agent claims.
- **Sandboxed Execution**: Prevents unauthorized shell, filesystem, or network access via Execution Broker policies.
- **Git Isolation**: Enforces isolated branches and checks base commit state to prevent applying stale patches.
- **Emergency Stop**: Global kill switch instantly pauses all workers, executions, and merge approvals.

---

## Repository Structure

```text
.
├── server/
│   ├── api/          # REST Gateway & WS streaming
│   ├── auth/         # Tenancy & RBAC
│   ├── budgets/      # Budget Manager
│   ├── commands/     # Command bus & Idempotency
│   ├── context/      # Context & Memory Engine
│   ├── events/       # Outbox/Inbox & WS server
│   ├── execution/    # Execution Broker & Lease Fencing
│   ├── git/          # Git isolation manager
│   ├── github/       # GitHub Provider & PR management
│   ├── jules/        # Jules Adapter & reconciliation
│   ├── merge/        # Merge Coordinator
│   ├── observability/# Structured JSON logger
│   ├── persistence/  # SQLite/PostgreSQL Database
│   ├── policies/     # Policy Engine & Risk Engine
│   ├── providers/    # AgentProvider interfaces
│   ├── queues/       # Priority Queue Manager
│   ├── scheduler/    # DAG Scheduler
│   ├── tasks/        # Task & Attempt models
│   ├── teams/        # AgentRegistry & Teams
│   ├── verification/ # Independent Verification Engine
│   └── workflows/    # Durable Workflow Engine
├── vscode/
│   └── extension/    # VS Code extension entry point
├── tests/            # Unit, integration, concurrency, & security tests
├── ARCHITECTURE.md
├── FINAL_ARCHITECTURE.md
├── ARCHITECTURE_AUDIT.md
├── SECURITY_MODEL.md
├── THREAT_MODEL.md
├── FAILURE_MODES.md
├── IMPLEMENTATION_STATUS.md
├── USAGE.md
└── README.md
```

---

## Getting Started

Refer to [`USAGE.md`](./USAGE.md) for detailed installation, configuration, API endpoints, and command references.
