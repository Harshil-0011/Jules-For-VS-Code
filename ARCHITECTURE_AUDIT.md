# Architecture Audit

## 1. Executive Summary
This document provides a comprehensive audit of the repository state for transforming it into a production-grade autonomous software-engineering control plane.

## 2. Core Design Principles
System design decisions adhere to the strict priority hierarchy:
```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

The system targets three interaction surfaces:
1. VS Code Extension
2. Coding IDE Interface
3. Coding CLI / Agent OS Shell

---

## 3. Current Architecture & Components
- **Modular Monolith**: Node.js / TypeScript application delivering task scheduling, lease management, workflow engines, agent team orchestration, sandboxing, and verification.
- **Persistence**: SQLite / PostgreSQL durable persistence for task states, outbox events, fencing leases, and evidence graphs.
- **Verification Engine**: Real execution verification running `npm run build` and `npm test` before merge approvals.

---

## 4. Strengths
- Clear separation between agent decisions and platform policy controls.
- Durable state storage preventing process-memory dependence.
- Robust security boundaries with secret redaction and Emergency Stop.

---

## 5. Architectural Safeguards
- **LLM Decisiveness vs. System Authority**: Agents propose changes; the database-backed orchestrator evaluates policy and controls state updates.
- **Provider API Isolation**: Jules API details are encapsulated within `JulesAdapter`.
- **Distributed Concurrency Safeguards**: Lease fencing tokens reject stale worker writes after node failures.
