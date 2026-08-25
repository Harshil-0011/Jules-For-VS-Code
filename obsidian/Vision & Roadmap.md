---
title: "Vision & Roadmap"
type: "roadmap"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "roadmap"
  - "vision"
  - "phases"
  - "non-goals"
aliases:
  - "Vision and Roadmap"
  - "Product Roadmap"
links:
  - "[[Home]]"
  - "[[Current Status]]"
  - "[[Architecture]]"
  - "[[Getting Started]]"
confidence: "high"
---

# Vision & Roadmap

## 1. Long-Term Vision

The **Jules Ecosystem** aims to establish the industry standard for **safe, verifiable, autonomous software engineering**.

By placing **Google Jules** at the center of a controlled, multi-product architecture, developers gain access to autonomous coding intelligence across their terminal (`jules` CLI), IDE (VS Code Extension), and dedicated standalone environments (Jules Coding IDE).

The platform guarantees that autonomous agent actions are always:
- **Safe**: Sandboxed execution, default `DENY` networking, Zero Trust permissions.
- **Verifiable**: Independent automated build and test execution before merge.
- **Recoverable**: Monotonic fencing tokens and transactional outbox state recovery.

---

## 2. Phased Canonical Roadmap

### Phase 0 — Repository Audit & Architecture Pivot
- [x] Conduct audit of legacy codebase and remove obsolete "Agent OS" abstractions.
- [x] Establish Version 4.0 Canonical Architecture specification (`FINAL_ARCHITECTURE.md`).
- [x] Audit dependencies, TypeScript configuration, and Jest test runner setup.

### Phase 1 — Shared Foundations
- [x] Implement core domain types (`Task`, `Attempt`, `Execution`, `Artifact`, `Evidence`, `Decision`).
- [x] Build Better-SQLite3 database persistence with WAL mode and foreign key constraints.
- [x] Implement transactional Outbox service and idempotent Inbox service.
- [x] Implement Lease Fencing Manager with monotonic fencing tokens.

### Phase 2 — Google Jules API Integration
- [x] Implement `JulesAdapter` supporting `v1alpha` session management.
- [x] Implement session creation, activity polling, plan approvals, and messaging.
- [x] Implement `AgentProvider` interface and capability discovery registry.

### Phase 3 — Core Agent Runtime & Safety Control Plane
- [x] Implement `ExecutionBroker` with shell command policy filtering (`sudo` / `rm -rf` blocking).
- [x] Implement automated secret redaction scanner for API keys and tokens.
- [x] Implement `PolicyEngine`, `RiskEngine`, `BudgetManager`, and Emergency Stop controller.
- [x] Implement topological `DAGScheduler` and `WorkflowEngine` step state machine.

### Phase 4 — Jules Code CLI & Terminal Agent
- [x] Define CLI command interface (`jules`, `jules "fix tests"`, `jules exec`, `jules review`, `jules fix`).
- [x] Implement CLI permission modes (`READ_ONLY`, `ASK`, `AUTO`, `CI`).
- [x] Build workspace discovery adapter and repository inspection primitives.

### Phase 5 — Jules Extension (VS Code)
- [x] Build VS Code extension entry point (`vscode/extension/extension.ts`).
- [x] Implement workspace adapter, Git adapter, and event client.
- [x] Implement VS Code command registry (`jules.newTask`, `jules.startTask`, `jules.emergencyStop`, etc.).
- [ ] Implement rich sidebar Webview UI for interactive task streaming and plan approvals.

### Phase 6 — Jules Coding IDE Foundation
- [x] Define multi-agent team orchestration (`TeamOrchestrator`) and sub-agent roles.
- [x] Implement `ContextEngine` multi-scope project memory (`GLOBAL`, `PROJECT`, `TASK`).
- [ ] Build desktop Electron application shell for standalone Jules Coding IDE.

### Phase 7 — AI-Native IDE Integration
- [ ] Connect IDE editor buffer events to `ContextEngine` decision stream.
- [ ] Implement real-time agent team inline code suggestions and inline diff review.
- [ ] Implement automated project memory summary indexing.

### Phase 8 — Multi-Agent Parallelism & Coordination
- [x] Implement `PriorityQueueManager` with priority scoring and tenant fairness.
- [ ] Build multi-session parallel Jules execution coordinator with Git branch isolation.
- [ ] Implement cross-agent task dependency graphs with dynamic sub-task spawning.

### Phase 9 — Advanced Sandboxing & Security
- [x] Implement process-level shell execution filtering and environment variable redaction.
- [ ] Migrate `ExecutionBroker` to containerized Docker sandboxing with network isolation.
- [ ] Add static analysis, dependency vulnerability scanning, and secret leak prevention gates.

### Phase 10 — Cross-Product Interoperability
- [ ] Implement session resumption across products (CLI → Extension → IDE).
- [ ] Verify protocol compatibility and task state synchronicity across products.
- [ ] Run multi-client concurrent task execution integration tests.

### Phase 11 — Production Hardening & Cloud Infrastructure
- [ ] Provide PostgreSQL database driver adapter for multi-tenant cloud deployments.
- [ ] Provide Redis event bus driver for distributed outbox processing.
- [ ] Implement automated database backup and point-in-time recovery tooling.

---

## 3. Explicit Non-Goals

To maintain focus and product discipline, the following are explicitly **out of scope**:

1. **Not an Operating System ("Agent OS")**:
   - The platform will **never** attempt to replace Linux, macOS, or Windows host kernels or process managers.
2. **No Unchecked Tool Access**:
   - LLM agents will **never** receive unrestricted host root/sudo execution rights.
3. **No Direct Inter-Product Dependencies**:
   - The VS Code Extension, Coding IDE, and CLI will **never** depend on one another for core functionality.
4. **No Agent Self-Approval for Merges**:
   - LLMs will **never** be permitted to bypass independent build and test verification to merge code changes.
5. **No Proprietary Vendor Lock-In**:
   - While Google Jules is the primary intelligence provider, the `AgentProvider` abstraction guarantees pluggability for alternative model providers.

---

## 4. Related Notes
- [[Current Status]] — Active rollout phase breakdown and verified test results.
- [[Project Overview]] — Core principles and system scope.
- [[Architecture]] — System architecture and product boundaries.
