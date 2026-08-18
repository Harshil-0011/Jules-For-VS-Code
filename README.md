# Jules Ecosystem

> **Jules-first autonomous software engineering ecosystem**

A production-oriented autonomous software engineering platform putting **Google Jules at the center of a controlled multi-product development system**.

The ecosystem provides three independent products:

1. **Jules Extension**: Bring Jules into your existing VS Code environment.
2. **Jules Coding IDE**: A standalone AI-native coding environment built around Jules.
3. **Jules Code CLI**: A terminal-first autonomous coding agent in the category of Claude Code / Codex CLI.

---

## Architecture Principle

> **Jules is the primary intelligence. The products are independent clients. The deterministic infrastructure controls execution.**

When design choices conflict, decisions strictly follow this priority hierarchy:

```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

---

## Ecosystem Overview

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

Detailed architectural documentation:
- [`FINAL_ARCHITECTURE.md`](./FINAL_ARCHITECTURE.md)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## Key Features

- **Three Independent Products**: Extension, Coding IDE, and Code CLI run independently without cross-product dependencies.
- **Terminal Coding Agent**: `jules` CLI supports interactive, task execution, headless, CI, review, and verification modes.
- **Bounded Agent Loop**: Interpret → Inspect → Plan → Policy Check → Execute → Observe → Verify → Repair.
- **Independent Claim Verification**: Code claims are independently executed (`npm run build`, `npm test`) before merge.
- **Zero Trust Security Boundary**: Sandboxed Execution Broker, default DENY network policy, and secret redaction.

---

## Documentation Index

- [`USAGE.md`](./USAGE.md) — Product usage and command references.
- [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) — Security policy and sandboxing.
- [`THREAT_MODEL.md`](./THREAT_MODEL.md) — Threat matrix and mitigations.
- [`FAILURE_MODES.md`](./FAILURE_MODES.md) — FMEA and recovery strategies.
- [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md) — Implementation rollout status.
- [`ARCHITECTURE_AUDIT.md`](./ARCHITECTURE_AUDIT.md) — Architectural inspection and product boundaries.
