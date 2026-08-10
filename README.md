# Jules Engineering Platform

> **Jules-first autonomous software engineering platform for VS Code**

A production-oriented autonomous software engineering platform that puts **Google Jules at the center of a controlled multi-agent development system**.

The platform connects VS Code, Jules, GitHub, verification systems, sandboxed tools, and additional AI agents through a durable orchestration layer.

It is designed to make autonomous coding **observable, verifiable, recoverable, and policy-controlled** rather than simply giving an AI unrestricted access to a repository.

---

## What This Project Is

The platform provides a control plane for autonomous software engineering.

At a high level:

```text
                         ┌─────────────────────┐
                         │       VS CODE       │
                         │                     │
                         │ Tasks               │
                         │ Agents              │
                         │ Teams               │
                         │ Activity             │
                         │ Changes              │
                         │ Verification         │
                         │ Approvals            │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    AGENT SERVER     │
                         │                     │
                         │ API                 │
                         │ Task Engine         │
                         │ Workflow Engine     │
                         │ Scheduler           │
                         │ Policy Engine       │
                         │ Agent Registry      │
                         │ Context / Memory    │
                         │ Verification        │
                         │ Audit               │
                         └──────────┬──────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
                     ▼              ▼              ▼
                 ┌───────┐      ┌───────┐      ┌──────────┐
                 │ Jules │      │GitHub │      │ Other    │
                 │ API   │      │ API   │      │ Agents   │
                 └───┬───┘      └───┬───┘      └────┬─────┘
                     │              │               │
                     └──────────────┼───────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ EXECUTION BROKER    │
                         │                     │
                         │ Tools               │
                         │ Sandbox             │
                         │ Git                 │
                         │ Tests               │
                         │ Network             │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   VERIFICATION      │
                         │                     │
                         │ Tests               │
                         │ Build               │
                         │ Security            │
                         │ Static Analysis     │
                         │ Evidence            │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ MERGE / APPROVAL    │
                         └─────────────────────┘
```

---

# Core Idea

The fundamental design principle is:

> **LLMs decide how to solve problems. The platform decides what is allowed to happen.**

Jules can plan, reason, write code, investigate failures, and propose changes.

The deterministic platform controls:

* authorization
* task state
* workflow state
* dependencies
* budgets
* tool permissions
* sandboxing
* Git isolation
* verification
* approvals
* merging
* auditability
* recovery

This prevents the agent itself from becoming the source of truth for the system.

---

# Why Jules Is the Primary Agent

Jules is the default coding agent because the platform is designed around a deep integration with its coding workflow.

However, Jules is **not hard-coded into the entire system**.

The architecture uses an agent-provider abstraction:

```text
                    Agent Interface
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
        Jules           Other             Local
        Adapter         Providers          Agents
```

This allows the platform to support additional agents without redesigning the orchestration layer.

Potential future providers include:

* Jules
* Gemini
* Codex
* Claude
* local models
* custom agents
* specialized security agents
* specialized testing agents

Provider-specific behavior belongs inside provider adapters.

---

# Multi-Agent Development

A single task can use multiple agents.

For example:

```text
                         Main Task
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
          Planner        Backend        Frontend
           Jules          Jules          Agent
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                       Integration
                            │
                            ▼
                      Security Review
                            │
                            ▼
                       Verification
                            │
                            ▼
                          Merge
```

Agents do not need to share mutable workspace state.

Instead, the platform coordinates them through durable tasks, artifacts, events, Git state, and verification results.

---

# Key Features

## Jules-first agent orchestration

Jules is the default provider while the architecture remains provider-independent.

## Multi-agent teams

Create teams containing:

* multiple Jules sessions
* Jules + other providers
* specialized reviewers
* testing agents
* security agents
* documentation agents

## Task DAGs

Represent complex engineering work as dependency graphs.

```text
Requirements
     │
     ▼
Architecture
     │
 ┌───┴────┐
 ▼        ▼
Backend  Frontend
 │        │
 └───┬────┘
     ▼
Integration
     │
     ▼
Verification
     │
     ▼
Review
     │
     ▼
Merge
```

Tasks can execute concurrently when their dependencies allow it.

## Durable workflows

Tasks survive:

* server restarts
* worker failures
* provider outages
* network failures
* retries

The platform does not rely on process memory for correctness.

## Git isolation

Agents work against isolated repository state.

The platform detects stale branches and patches instead of silently applying changes based on outdated repository state.

## Independent verification

Agent claims are not treated as proof.

If an agent says:

```text
Tests pass.
```

the verification engine independently executes the tests.

## Sandboxed tools

Agents do not receive unrestricted host access.

Tool execution goes through the execution broker and policy system.

## Security policies

Control:

* filesystem access
* shell commands
* network access
* GitHub operations
* credentials
* dependency changes
* deployment
* merging

## Human-in-the-loop

Humans can:

* approve plans
* approve high-risk changes
* review evidence
* pause tasks
* cancel tasks
* take over execution
* approve merges

## Evidence and provenance

Important decisions can be traced to:

```text
Task
  ↓
Attempt
  ↓
Execution
  ↓
Agent
  ↓
Tool Calls
  ↓
Artifact
  ↓
Verification
  ↓
Decision
```

---

# Architecture

The complete architecture is defined in:

**[`FINAL_ARCHITECTURE.md`](./FINAL_ARCHITECTURE.md)**

Before making architectural changes, read that document.

Additional engineering documentation:

```text
ARCHITECTURE_AUDIT.md
FINAL_ARCHITECTURE.md
SECURITY_MODEL.md
THREAT_MODEL.md
FAILURE_MODES.md
IMPLEMENTATION_STATUS.md
```

These documents are intended to evolve with the implementation.

---

# Repository Structure

The target architecture is organized into explicit modules.

```text
.
├── server/
│   ├── api/
│   ├── auth/
│   ├── tenancy/
│   ├── commands/
│   ├── events/
│   ├── tasks/
│   ├── workflows/
│   ├── scheduler/
│   ├── teams/
│   ├── agents/
│   ├── jules/
│   ├── providers/
│   ├── tools/
│   ├── execution/
│   ├── sandbox/
│   ├── policies/
│   ├── budgets/
│   ├── context/
│   ├── memory/
│   ├── git/
│   ├── github/
│   ├── verification/
│   ├── evidence/
│   ├── artifacts/
│   ├── merge/
│   ├── approvals/
│   ├── audit/
│   ├── observability/
│   └── persistence/
│
├── vscode/
│   └── extension/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   ├── concurrency/
│   ├── security/
│   ├── chaos/
│   └── end_to_end/
│
├── FINAL_ARCHITECTURE.md
├── ARCHITECTURE_AUDIT.md
├── SECURITY_MODEL.md
├── THREAT_MODEL.md
├── FAILURE_MODES.md
├── IMPLEMENTATION_STATUS.md
└── README.md
```

The exact structure may evolve as implementation proceeds.

---

# Reliability Model

The system is designed around several invariants.

### No unauthorized execution

Every privileged operation passes through authorization and policy checks.

### No stale worker writes

Workers use leases and fencing to prevent expired workers from modifying current state.

### No silent duplicate operations

Commands and events use idempotency mechanisms.

### No silent stale patches

Changes based on an outdated repository state are detected.

### No agent-only verification

Agent claims are independently verified.

### No process-memory dependency

Durable workflow state lives in persistent storage.

### No unrestricted tool execution

Tool access is policy-controlled and sandboxed.

### No repository override of security policy

Repository content is treated as untrusted input.

### No uncontrolled autonomy

Budgets, policies, risk levels, and approval gates constrain autonomous actions.

---

# Technology Architecture

The exact technology choices are implementation-dependent, but the production architecture is designed around:

| Component         | Responsibility                                 |
| ----------------- | ---------------------------------------------- |
| PostgreSQL        | Durable system state                           |
| Redis             | Optional ephemeral coordination/caching/queues |
| Object Storage    | Large immutable artifacts                      |
| Git               | Source history                                 |
| GitHub            | Remote repository/PR state                     |
| Jules API         | Primary coding agent                           |
| Sandbox Runtime   | Isolated code execution                        |
| VS Code Extension | User interface                                 |
| Agent Server      | Orchestration/control plane                    |

PostgreSQL remains authoritative for durable orchestration state.

Redis must not become the only source of truth for workflow state.

---

# Jules API

Jules integration is isolated behind an adapter.

This is intentional.

The Jules API is version-sensitive, and external provider capabilities can change.

The platform therefore does **not** spread Jules-specific API calls throughout the codebase.

Conceptually:

```text
Application
     │
     ▼
AgentProvider
     │
     ▼
JulesAdapter
     │
     ▼
Jules API
```

The adapter must only implement capabilities actually supported by the current Jules API.

Unsupported operations must be represented explicitly rather than simulated.

Refer to the official Jules API documentation before modifying the adapter.

---

# Security Philosophy

This system executes software engineering workloads, which means it potentially executes untrusted code.

Security is therefore a first-class architectural concern.

Potential threats include:

* prompt injection
* malicious repositories
* malicious dependencies
* credential theft
* arbitrary code execution
* network exfiltration
* privilege escalation
* compromised agents
* compromised provider credentials
* GitHub token abuse
* cross-project data leakage
* malicious tool calls
* event replay
* stale workers
* supply-chain attacks

Repository content is treated as untrusted data.

The trust hierarchy is:

```text
SYSTEM POLICY
      >
USER INTENT
      >
ORCHESTRATOR POLICY
      >
AGENT ROLE
      >
REPOSITORY CONTENT
      >
EXTERNAL CONTENT
```

Repository instructions cannot override platform security policy.

---

# Verification Philosophy

Autonomous coding is not considered successful merely because an agent generated code.

A successful task should have evidence.

For example:

```text
Agent proposes change
        ↓
Change captured
        ↓
Build
        ↓
Unit tests
        ↓
Integration tests
        ↓
Static analysis
        ↓
Security analysis
        ↓
Dependency checks
        ↓
Policy evaluation
        ↓
Review
        ↓
Merge
```

The verification requirements depend on risk.

---

# Risk Levels

Changes are classified as:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Examples of high-risk changes:

* authentication
* authorization
* secrets
* database migrations
* infrastructure
* deployment
* public APIs
* security boundaries
* dependency changes

Higher-risk operations require stronger verification and potentially human approval.

---

# Development Philosophy

The platform follows these principles:

1. **Deterministic orchestration**
2. **Explicit state**
3. **Durable workflows**
4. **Provider isolation**
5. **Least privilege**
6. **Independent verification**
7. **Immutable provenance**
8. **Fail-safe behavior**
9. **Observable execution**
10. **Recoverability**
11. **Human override**
12. **Testable boundaries**

---

# Development Status

See:

**[`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md)**

for the current implementation state.

Do not assume that architecture described in this README is already implemented.

Documentation describes the target system unless explicitly marked otherwise.

---

# Getting Started

## Requirements

The exact requirements depend on the current implementation.

The target production architecture requires:

* Node.js or the project's configured runtime
* PostgreSQL
* optional Redis
* Git
* GitHub access
* Jules API access
* VS Code
* sandbox runtime

Check the project's package manifests and environment configuration for the currently supported versions.

---

# Configuration

Never commit credentials.

Use environment variables or the project's secure configuration mechanism.

Typical configuration categories include:

```text
DATABASE
JULES
GITHUB
AUTH
SANDBOX
NETWORK
STORAGE
OBSERVABILITY
POLICIES
BUDGETS
```

Credentials must never be committed to Git.

If credentials are accidentally committed:

1. revoke them immediately
2. rotate them
3. remove them from the repository
4. inspect repository history
5. investigate potential exposure

---

# Local Development

The intended development workflow is:

```text
Clone repository
      ↓
Install dependencies
      ↓
Configure environment
      ↓
Start PostgreSQL
      ↓
Run migrations
      ↓
Start agent server
      ↓
Launch VS Code extension
      ↓
Create development task
      ↓
Run Jules / mock provider
      ↓
Verify
```

The project should support a provider-mocked development mode so core orchestration can be tested without making real Jules API calls.

---

# Testing

Run the project's standard test commands once implementation is available.

The test suite is expected to cover:

```text
Unit
Integration
Contract
End-to-End
Security
Concurrency
Chaos
Fault Injection
Recovery
```

Particular attention should be paid to:

* duplicate events
* duplicate commands
* worker crashes
* expired leases
* fencing tokens
* provider failures
* Git conflicts
* stale patches
* concurrent agents
* user takeover
* database failures
* event failures
* sandbox failures
* emergency stop
* recovery after restart

---

# Production Readiness

Before production deployment, verify:

* authentication
* authorization
* secret management
* sandbox isolation
* network restrictions
* database backups
* disaster recovery
* migrations
* rate limits
* provider limits
* audit logging
* observability
* retention policies
* security scanning
* concurrency testing
* chaos testing
* recovery testing

The system must not be considered production-ready simply because the happy path works.

---

# Important Design Constraint

There is no honest way to guarantee that a distributed autonomous system has literally "zero holes."

Instead, this project aims to ensure that:

> **Failures are bounded, observable, recoverable, and unable to silently violate critical system invariants.**

Known residual risks must be documented rather than hidden.

---

# Roadmap

## Phase 1

Foundation:

* configuration
* database
* migrations
* dependency injection
* repositories
* logging

## Phase 2

Orchestration:

* tasks
* attempts
* executions
* DAG
* workflows
* commands
* events

## Phase 3

Reliability:

* outbox
* inbox
* idempotency
* leases
* fencing
* recovery
* scheduling

## Phase 4

Jules:

* Jules adapter
* authentication
* sessions
* activities
* provider reconciliation

## Phase 5

GitHub:

* repositories
* branches
* commits
* pull requests
* merge coordination

## Phase 6

Verification:

* testing
* static analysis
* security
* evidence
* provenance

## Phase 7

Security:

* policy engine
* sandbox
* permissions
* secrets
* network controls
* risk engine

## Phase 8

Multi-Agent:

* agent registry
* capabilities
* multiple Jules
* heterogeneous providers
* team orchestration

## Phase 9

Memory:

* project memory
* task memory
* context engine
* provenance-aware retrieval

## Phase 10

VS Code:

* task UI
* agent UI
* team UI
* activity
* evidence
* approvals
* human takeover

## Phase 11

Hardening:

* chaos
* concurrency
* security
* recovery
* performance

---

# Contributing

Changes should preserve the architectural invariants.

Before submitting significant changes:

1. Read `FINAL_ARCHITECTURE.md`.
2. Read the relevant security documentation.
3. Identify affected bounded contexts.
4. Add or update tests.
5. Check concurrency implications.
6. Check authorization implications.
7. Check failure recovery.
8. Update documentation if architecture changes.
9. Do not introduce provider-specific logic into the core orchestration layer.

---

# Architectural Rule of Thumb

When deciding where code belongs, ask:

> **Is this an agent decision or a platform decision?**

If it is an agent decision:

```text
Agent / Provider
```

If it is a safety, state, authorization, scheduling, verification, or lifecycle decision:

```text
Control Plane
```

That separation should remain intact.

---

# License

Add the project's chosen license here.

---

# Project Vision

The long-term goal is not simply:

> "Put Jules inside VS Code."

The goal is:

> **Build an autonomous software-engineering operating system where Jules can lead engineering work, specialized agents can collaborate, humans can intervene at any point, and every autonomous action is controlled, observable, verifiable, and recoverable.**

VS Code is the interface.

Jules is the primary coding intelligence.

The orchestration platform is the control system.

GitHub is the source-control collaboration layer.

Verification is the trust layer.

Policy and sandboxing are the safety layer.

Together they form the foundation for reliable autonomous software engineering.
