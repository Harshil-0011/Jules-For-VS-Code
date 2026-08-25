---
title: "Problems & Solutions"
type: "problems"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "problems"
  - "solutions"
  - "fmea"
  - "troubleshooting"
aliases:
  - "Problems and Solutions"
  - "FMEA & Troubleshooting"
links:
  - "[[Home]]"
  - "[[Architecture]]"
  - "[[Current Status]]"
  - "[[Features/Security]]"
confidence: "high"
---

# Problems & Solutions

## 1. Architectural History & Solved Problems

Over the course of platform development, several critical architectural issues were identified and resolved:

### Solved Problem 1: Over-architected "Agent OS" Monolith
- **Problem**: Earlier iterations attempted to model the system as an "Agent OS" that controlled host operating system primitives, resulting in tight coupling between products and unmaintainable scope.
- **Solution**: Permanently removed "Agent OS" concepts in Version 4.0. Redefined the system as three independent client products (**Jules Extension**, **Jules Coding IDE**, **Jules Code CLI**) sharing a lightweight protocol and deterministic control plane backend.

### Solved Problem 2: Stale Worker Writes & Split-Brain Execution
- **Problem**: When a worker process crashed or suffered network delay, a newly spawned worker would start processing the same task. If the original worker recovered, it would overwrite new state.
- **Solution**: Implemented monotonic fencing tokens in `server/execution/leases.ts`. Every lease renewal increments `fencing_token`. Database updates reject writes from workers presenting stale fencing tokens.

### Solved Problem 3: Unverified Agent Success Claims ("Hallucinated Success")
- **Problem**: LLM agents frequently declared tasks "completed and verified" without executing real tests or builds.
- **Solution**: Built the `VerificationEngine` (`server/verification/verification_engine.ts`). Agent claims are treated as untrusted hypotheses until verified by running independent sub-processes (`npm run build`, `npm test`) to generate structured `Evidence`.

### Solved Problem 4: Secret Leakage in Logs & Event Streams
- **Problem**: Tool call outputs (shell output, environment variables, API responses) risk printing API keys (`sk-...`, `ghp_...`, JWTs) into logs, outbox tables, or WebSocket streams.
- **Solution**: Added automatic secret redaction scanners in `ExecutionBroker.redactSecrets()`. All output strings are scanned against regex patterns and sanitized (`[REDACTED_SECRET]`) prior to persistence.

---

## 2. Open Problems Matrix

The table below details current open technical challenges, impact, workarounds, and planned fixes:

| Problem ID | Issue Description | Impact | Current Workaround | Planned Fix |
|---|---|---|---|---|
| **OP-01** | `jules.googleapis.com` `v1alpha` API rate limits or transient 5xx outages | Jules calls fail; task execution pauses | Exponential backoff and retry loop in `JulesAdapter` | Circuit breaker pattern and local fallback mode |
| **OP-02** | Heavy parallel test suite execution causes sandbox CPU/RAM exhaustion | Task timeouts and dropped worker heartbeats | Limit Jest concurrency with `--runInBand` | Docker container sandbox resource isolation |
| **OP-03** | Complex multi-repo workspace dependencies not resolved by local Git manager | Tasks touching multiple repos fail base validation | Isolate tasks to single repository root | Multi-repo workspace context provider |
| **OP-04** | Sub-process verification timeout (15s limit) on large builds | Task marked `REJECTED` prematurely | Increase timeout or run targeted sub-tests | Configurable per-task verification timeouts |
| **OP-05** | WebSocket client reconnection drops intermediate event notifications | Client UI out of sync with backend state | Polling REST API `/api/v1/tasks` on reconnect | Event sequence ID replay buffer in Outbox |

---

## 3. Failure Modes and Effects Analysis (FMEA)

| Failure Cause | Effect on System | Detection Mechanism | Mitigation Strategy | Recovery Procedure |
|---|---|---|---|---|
| **Jules API Outage** | Agent calls fail; tasks stall | HTTP 5xx tracking in `JulesAdapter` | Circuit breaker opens; state set to `BLOCKED` | Resume session automatically when API restores |
| **Worker Process Crash** | Mid-execution task stops abruptly | Lease heartbeat expiration in DB | Lease expires; scheduler picks up task | New worker acquires lease with higher token & resumes |
| **Database Partition** | Read/write queries fail | Better-SQLite3 exception throwing | Rollback transaction; fail-closed | Re-establish connection & process pending Outbox |
| **Git Merge Conflict** | Pull request cannot merge cleanly | `GitManager.validateBaseCommit()` failure | Mark merge result `STALE_BASE_COMMIT` | Rebase branch against main and re-run verification |
| **Sandbox Resource Ceiling** | Worker process killed by OS | Sub-process non-zero exit or SIGKILL | Process CPU/RAM limits & 10s command timeout | Terminate sandbox and log failure artifact |

---

## 4. Troubleshooting Playbook

### Scenario 1: Emergency Stop Triggered
- **Symptom**: All tool calls return `EMERGENCY_STOP: Tool execution blocked by global emergency stop`.
- **Diagnosis**: Check log for `EMERGENCY_STOP_ACTIVATED` or check `executionBroker.isEmergencyStopped()`.
- **Resolution**: Reset emergency stop via REST Gateway:
  ```bash
  curl -X POST http://localhost:3000/api/v1/emergency-stop/reset
  ```

### Scenario 2: Merge Evaluation Rejected with `STALE_BASE_COMMIT`
- **Symptom**: Calling `/api/v1/tasks/:id/merge` returns `success: false`.
- **Diagnosis**: The branch base commit does not match current target HEAD commit.
- **Resolution**: Rebase the active task branch onto current target HEAD, run tests locally, and re-trigger merge evaluation.

### Scenario 3: Tool Execution Blocked by `POLICY_DENIED`
- **Symptom**: Tool call fails with `SANDBOX_VIOLATION` or `POLICY_DENIED`.
- **Diagnosis**: Command contained dangerous keywords (`sudo`, `rm -rf /`, `/etc/`) or violated Policy Engine permissions.
- **Resolution**: Reformulate command to conform to non-root sandbox execution policy.

---

## 5. Lessons Learned
1. **Never Trust Agent Claims**: Agents will claim tests pass even when they fail. Automated, independent verification sub-processes are non-negotiable.
2. **Keep Client Products Independent**: Combining Extension, IDE, and CLI into a single monolith creates unmaintainable coupling.
3. **Fail Closed on Policy & Budget**: If a budget check or policy check fails, execution must halt immediately before shell command dispatch.
