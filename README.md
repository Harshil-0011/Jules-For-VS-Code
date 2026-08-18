# Jules Ecosystem

> **Jules-first autonomous software engineering ecosystem**

A production-oriented autonomous software engineering ecosystem that puts **Google Jules at the center of a controlled development system** comprising three independent products:

1. **Jules Extension**: Bring Jules into existing development environments (initial target: VS Code).
2. **Jules Coding IDE**: A standalone AI-native development environment.
3. **Jules Code CLI**: A terminal-first autonomous coding agent in the category of Claude Code / Codex CLI.

---

## Architecture Principle

> **Jules is the primary intelligence. The products are independent clients. The deterministic infrastructure controls execution.**

The platform enforces:
```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

---

## Ecosystem Architecture

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

Detailed architectural specifications are located in:
- [`FINAL_ARCHITECTURE.md`](./FINAL_ARCHITECTURE.md)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## Key Features

- **Three Independent Products**: Extension, Coding IDE, and Code CLI function independently without cross-product dependencies.
- **Terminal-First Coding Agent**: `jules` CLI supports interactive, task execution, headless, CI, review, and verification modes.
- **Autonomous Agent Loop**: Interpret → Inspect → Plan → Policy Check → Execute → Observe → Verify → Repair.
- **Independent Verification**: Claims are independently verified using real builds and tests before merging.
- **Zero Trust Security**: Sandboxed Execution Broker, default DENY network policy, and secret redaction.

---

## Getting Started

Refer to [`USAGE.md`](./USAGE.md) for details on installing, configuring, running, and interacting with the Jules Ecosystem.
