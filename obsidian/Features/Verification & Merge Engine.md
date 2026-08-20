---
title: "Verification & Merge Engine"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "verification"
  - "merge"
  - "evidence"
  - "claims"
aliases:
  - "Verification Engine"
  - "Merge Coordinator"
  - "Verification & Merge Engine"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Features/Git & GitHub Integration]]"
  - "[[Features/Security]]"
confidence: "high"
---

# Verification & Merge Engine Feature Specification

## 1. System Overview

The **Verification & Merge Engine** subsystem enforces independent claim validation and automated merge control (`server/verification/verification_engine.ts`, `server/merge/merge_coordinator.ts`).

In adherence to system principles, **"Jules says it works" is not verification**. The platform independently spawns sub-process checks (`npm run build`, `npm test`) to verify code claims and record immutable `Evidence` before merging changes.

---

## 2. Key Components

1. **`VerificationEngine`** (`server/verification/verification_engine.ts`):
   - Spawns isolated shell sub-processes (`execFileAsync`) to run real build and test commands:
     - Build Check: `npm run build` (timeout 15s).
     - Test Check: `npm test` (timeout 15s).
   - Generates and records `Evidence` records (`claim`, `status`, `details`) in the SQLite `evidence` table.
   - Statuses: `VERIFIED` (exit code 0), `REJECTED` (non-zero exit code or timeout).
2. **`MergeCoordinator`** (`server/merge/merge_coordinator.ts`):
   - Evaluates merge safety before permitting pull request merges:
     1. Validates HEAD base commit (`validateBaseCommit`).
     2. Classifies risk level via `RiskEngine`.
     3. Evaluates permissions via `PolicyEngine`.
     4. Enforces human approval gate if risk is `HIGH` or `CRITICAL`.
     5. Dispatches `VerificationEngine` build and test checks.

---

## 3. Merge Evaluation Sequence Flow Diagram

```text
CLIENT GATEWAY             MERGE COORDINATOR           VERIFICATION ENGINE           EVIDENCE TABLE
      │                            │                            │                          │
      │ evaluateMerge(taskId, ...) │                            │                          │
      ├───────────────────────────►│                            │                          │
      │                            │ validateBaseCommit()       │                          │
      │                            ├──────────────┐             │                          │
      │                            │              │             │                          │
      │                            ◄──────────────┘             │                          │
      │                            │                            │                          │
      │                            │ classifyRisk & Policy      │                          │
      │                            ├──────────────┐             │                          │
      │                            │              │             │                          │
      │                            ◄──────────────┘             │                          │
      │                            │                            │                          │
      │                            │ verifyClaims(req)          │                          │
      │                            ├───────────────────────────►│                          │
      │                            │                            │ execFile('npm','build')  │
      │                            │                            ├──────────────┐           │
      │                            │                            │              │           │
      │                            │                            ◄──────────────┘           │
      │                            │                            │ execFile('npm','test')   │
      │                            │                            ├──────────────┐           │
      │                            │                            │              │           │
      │                            │                            ◄──────────────┘           │
      │                            │                            │                          │
      │                            │                            │ INSERT INTO evidence     │
      │                            │                            ├─────────────────────────►│
      │                            │ Evidence Results           │                          │
      │                            ◄────────────────────────────┤                          │
      │ MergeResult                │                            │                          │
      ◄────────────────────────────┤                            │                          │
```

---

## 4. Evidence Status Lifecycle

Evidence records track verification results with provenance details:

```text
UNVERIFIED ──► [Run Sub-Process Checks] ──┬──► VERIFIED (Success)
                                          │
                                          └──► REJECTED (Failure / Timeout)
```

---

## 5. Known Issues & Edge Cases

1. **Sub-process Timeout During Heavy Builds**: Complex projects requiring longer build times can trigger the 15-second sub-process timeout ceiling, marking evidence `REJECTED`. Timeout ceilings are configurable per verification request.
2. **Human Approval Requirement Bypass**: High or Critical risk changes attempted without human approval return `requiresApproval: true` and `reason: APPROVAL_REQUIRED`, blocking automatic merging.

---

## 6. Related Notes
- [[Features/Git & GitHub Integration]] — Git workspace isolation and base commit validation.
- [[Features/Security]] — Risk Engine risk classification.
- [[Features/Database]] — `evidence` database schema table.
