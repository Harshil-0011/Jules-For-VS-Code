---
title: "Testing & Quality Assurance"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "testing"
  - "jest"
  - "unit-tests"
  - "integration-tests"
aliases:
  - "Testing"
  - "Test Suite"
  - "Quality Assurance"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Current Status]]"
  - "[[Features/Verification & Merge Engine]]"
confidence: "high"
---

# Testing & Quality Assurance Feature Specification

## 1. System Overview

The **Testing & Quality Assurance** subsystem defines the automated testing framework (`tests/`) powering platform correctness, concurrency verification, and independent claim validation.

Powered by **Jest** (`jest --runInBand`), the test suite executes unit, integration, concurrency, and security tests without cross-test state leakage.

---

## 2. Key Components

1. **Jest Configuration** (`jest.config.js`):
   - Configures `ts-jest` preset, TypeScript module resolution, test environment, and match patterns (`tests/**/*.test.ts`).
2. **Unit Test Suites** (`tests/unit/`):
   - `dag.test.ts`: DAG cycle detection, ready task discovery, failure cascade propagation.
   - `execution_policy.test.ts`: Execution broker policy denial, shell sandboxing, secret redaction, emergency stop.
   - `phases_6_10.test.ts`: Sub-agent team orchestration, context memory query/store, queue priority scheduling.
   - `reliability.test.ts`: Transactional outbox publishing, idempotent inbox deduplication.
   - `vscode_extension.test.ts`: VS Code extension activation, workspace discovery, command execution.
   - `workflow.test.ts`: Workflow step state transitions, retries, escalation.
3. **Integration Test Suites** (`tests/integration/`):
   - `jules_adapter.test.ts`: Google Jules `v1alpha` session creation, messaging, activity polling, plan approval.
   - `git_github.test.ts`: Workspace Git discovery, base commit validation, pull request creation.
4. **Concurrency Test Suites** (`tests/concurrency/`):
   - `leases.test.ts`: Lease fencing monotonicity and stale worker write rejection under concurrent access.

---

## 3. Test Runner Execution Sequence Flow

```text
DEVELOPER / CI             NPM TEST             JEST CLI (--runInBand)          TS-JEST TRANSFORM
      │                        │                          │                             │
      │ npm test               │                          │                             │
      ├───────────────────────►│                          │                             │
      │                        │ jest --runInBand         │                             │
      │                        ├─────────────────────────►│                             │
      │                        │                          │ Discover *.test.ts files    │
      │                        │                          ├──────────────┐              │
      │                        │                          │              │              │
      │                        │                          ◄──────────────┘              │
      │                        │                          │                             │
      │                        │                          │ Transform TypeScript        │
      │                        │                          ├────────────────────────────►│
      │                        │                          │                             │ Transpiled JS
      │                        │                          │                             ◄───────────────┤
      │                        │                          │                             │
      │                        │                          │ Execute Test Suites         │
      │                        │                          │ Sequentially                │
      │                        │                          ├──────────────┐              │
      │                        │                          │              │              │
      │                        │                          ◄──────────────┘              │
      │ Test Summary Output    │                          │                             │
      ◄────────────────────────┴──────────────────────────┤                             │
```

---

## 4. Subsystem Configuration (`jest.config.js`)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
```

---

## 5. Execution Command Reference

```bash
# Run all 9 test suites sequentially
npm test

# Run a specific test file
npx jest tests/unit/execution_policy.test.ts

# Run tests in watch mode during development
npx jest --watch
```

---

## 6. Known Issues & Edge Cases

1. **Preset Resolution when Dependencies Missing**: Running `npm test` without installing node dependencies causes `Preset ts-jest not found`. Running `npm ci` resolves dependency packages.
2. **Database State Leakage in Parallel Execution**: SQLite in-memory databases must be run sequentially (`--runInBand`) or created with unique file paths to avoid file lock collisions.

---

## 7. Related Notes
- [[Current Status]] — Verified test suite results and coverage summary.
- [[Features/Verification & Merge Engine]] — Independent claim verification engine.
- [[Getting Started]] — Instructions for setting up local test environment.
