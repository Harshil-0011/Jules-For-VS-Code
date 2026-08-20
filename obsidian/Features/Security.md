---
title: "Security & Risk Control"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "security"
  - "policy"
  - "risk"
  - "redaction"
aliases:
  - "Security"
  - "Risk Control"
  - "Policy Engine"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Features/Execution & Leases]]"
  - "[[Features/Configuration]]"
confidence: "high"
---

# Security & Risk Control Feature Specification

## 1. System Overview

The **Security & Risk Control** subsystem enforces the platform's **Zero Trust for Untrusted Content** architecture across all tool executions, shell commands, and agent outputs.

Repository code, issue descriptions, PR comments, and web content are treated as untrusted data. Repository content can **never** override system security policy or bypass execution boundaries.

---

## 2. Key Components

1. **`ExecutionBroker`** (`server/execution/execution_broker.ts`):
   - Central execution broker through which all tool calls pass.
   - Enforces emergency stop checks, budget validation, policy checks, shell command safety filters, and secret redaction.
2. **`PolicyEngine`** (`server/policies/policy_engine.ts`):
   - Evaluates requested actions against system permissions and risk criteria, returning `ALLOW`, `DENY`, or `REQUIRES_APPROVAL`.
3. **`RiskEngine`** (`server/policies/risk_engine.ts`):
   - Categorizes operations into `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL` risk levels based on touched files and change descriptions.
4. **Secret Redaction Scanner (`redactSecrets`)**:
   - Scans tool output streams against regular expression patterns (`sk-...`, `ghp_...`, JWTs) and redacts matching strings to `[REDACTED_SECRET]`.

---

## 3. Tool Execution Security Sequence Flow

```text
AGENT REQUEST            EXECUTION BROKER          POLICY ENGINE          SHELL SANDBOX          SECRET REDACTOR
      │                         │                        │                      │                       │
      │ executeTool(req)        │                        │                      │                       │
      ├────────────────────────►│                        │                      │                       │
      │                         │ checkEmergencyStop()   │                      │                       │
      │                         ├──────────────┐         │                      │                       │
      │                         │              │         │                      │                       │
      │                         ◄──────────────┘         │                      │                       │
      │                         │                        │                      │                       │
      │                         │ evaluate(tool, args)   │                      │                       │
      │                         ├───────────────────────►│                      │                       │
      │                         │                        │ ALLOW / DENY         │                       │
      │                         │                        ◄──────────────────────┤                       │
      │                         │                        │                      │                       │
      │                         │ Check Prohibited Cmds  │                      │                       │
      │                         │ (sudo / rm -rf)        │                      │                       │
      │                         ├──────────────┐         │                      │                       │
      │                         │              │         │                      │                       │
      │                         ◄──────────────┘         │                      │                       │
      │                         │                        │                      │                       │
      │                         │ execAsync(cmd)         │                      │                       │
      │                         ├──────────────────────────────────────────────►│                       │
      │                         │                        │                      │ Raw STDOUT/STDERR     │
      │                         │                        │                      ◄───────────────────────┤
      │                         │                        │                      │                       │
      │                         │ redactSecrets(output)  │                      │                       │
      │                         ├──────────────────────────────────────────────────────────────────────►│
      │                         │                        │                      │                       │ Clean Output
      │                         ◄───────────────────────────────────────────────────────────────────────┤
      │ Clean ToolResult        │                        │                      │                       │
      ◄─────────────────────────┤                        │                      │                       │
```

---

## 4. Subsystem Configuration

Configured via environment variables and policy rules:

| Setting | Variable | Default Value | Description |
|---|---|---|---|
| Emergency Stop | `EMERGENCY_STOP` | `false` | Global halt flag blocking all tool operations. |
| Network Policy | Internal Policy | `DENY` | Default deny networking policy for agent execution sandboxes. |

---

## 5. Prohibited Shell Commands & Sandbox Rules

The `ExecutionBroker` explicitly blocks high-risk command strings:
- Commands containing `sudo`
- Commands referencing system root directories (`/etc/`)
- Recursive root deletion commands (`rm -rf /`)

When detected, execution is immediately halted with `SANDBOX_VIOLATION: Command prohibited by sandbox isolation policy`.

---

## 6. Known Issues & Edge Cases

1. **Custom Base64 Secret Formats**: Secret redaction regexes cover standard API key patterns (`sk-...`, `ghp_...`, JWTs). Non-standard secret string formats require custom policy rule additions.
2. **Sub-process Spawn Timeouts**: Commands exceeding the 10-second timeout ceiling are terminated with SIGTERM to prevent process starvation.

---

## 7. Related Notes
- [[Features/Execution & Leases]] — Execution broker and budget management.
- [[Features/Verification & Merge Engine]] — Verification gates and risk evaluation.
- [[Features/Configuration]] — Global emergency stop configuration.
