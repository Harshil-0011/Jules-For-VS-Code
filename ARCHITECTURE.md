# System Architecture & Design Specification

## 1. Executive Summary
This project defines the architecture for the **Jules Ecosystem**, comprising three independent products sharing a lightweight protocol and library layer:
1. **Jules Extension**: Integration with existing IDEs (VS Code).
2. **Jules Coding IDE**: Standalone AI-native development environment.
3. **Jules Code CLI**: Terminal-first autonomous coding agent.

## 2. Core Priority Hierarchy
When design choices, performance optimizations, or operational tradeoffs conflict, system decisions MUST strictly follow this priority hierarchy:

```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

## 3. Product Ecosystem Architecture

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

## 4. Product Independence Rule
The three products must be:
- independently installable
- independently runnable
- independently testable
- independently versioned
- independently deployable

No product depends on another product for normal operation. The "Agent OS" concept is permanently removed.

## 5. Core Platform Principle
Jules is the primary intelligence. The products are independent clients. The deterministic infrastructure controls execution, sandboxing, verification, and policy enforcement.

## 6. Detailed System Specification
For full architecture specifications, refer to [`FINAL_ARCHITECTURE.md`](./FINAL_ARCHITECTURE.md).
