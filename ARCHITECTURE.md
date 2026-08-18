# System Architecture Specification

## Jules Ecosystem (Version 4.0 Canonical Architecture)

### 1. Overview
The **Jules Ecosystem** consists of three independent products sharing a lightweight common foundation (protocols, SDKs, core tooling):

1. **Jules Extension**: VS Code integration bringing Jules into existing IDE environments.
2. **Jules Coding IDE**: A standalone AI-native development environment.
3. **Jules Code CLI**: A terminal-first autonomous coding agent.

---

### 2. Core Priority Hierarchy
System choices and tradeoffs strictly follow this priority hierarchy:

```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

---

### 3. Product Relationship Diagram

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

---

### 4. Product Independence Rule
The three products must be:
- independently installable
- independently runnable
- independently testable
- independently versioned
- independently deployable

No product depends on another product for normal operation. The "Agent OS" concept is permanently removed.

---

### 5. Core Platform Principle
> **Jules is the primary intelligence. The products are independent clients. The deterministic infrastructure controls execution.**

The LLM decides *what to solve* and *how to write code*.
The platform decides *permissions*, *sandboxing*, *verification*, *budgets*, and *merge policies*.

For the complete 66-section specification, refer to [`FINAL_ARCHITECTURE.md`](./FINAL_ARCHITECTURE.md).
