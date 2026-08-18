# Failure Modes and Effects Analysis (FMEA)

Failure recovery mechanisms strictly observe the system priority hierarchy:
```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

| Failure Cause | Effect | Detection | Mitigation | Recovery | Severity | Likelihood | Residual Risk |
|---|---|---|---|---|---|---|---|
| Jules API Outage / 500 | Jules agent calls fail | Circuit breaker opens; HTTP 5xx tracking | Exponential backoff, jitter, fallback to queue or alternate provider | Re-query status, resume session when online | High | Medium | Bounded |
| Worker Process Crash | Active execution interrupted mid-task | Lease heartbeat timeout; missing fence token | Database lease expiration; clean worker pickup | New worker acquires lease, inspects state, resumes or retries | Medium | Low | Bounded |
| Database Network Partition | Control plane cannot update state | DB connection pool error | Transactions rollback; fail closed; stop new executions | Re-establish connection, outbox re-sync | High | Low | Minimal |
| Git Merge / Semantic Conflict | Agent PR cannot merge cleanly | Git merge conflict or integration test failure | Verification Engine flags conflict; Marks task `BLOCKED` | Rebase branch, re-run agent or request human review | Medium | High | Bounded |
| Malicious Package / Vulnerability | Dependency introduces security risk | Dependency scanner / Risk Engine alert | High Risk classification; require approval gate | Reject patch or prompt engineer for fix | High | Low | Low |
| Network Proxy Timeout | Provider / GitHub request hangs | Client socket timeout | Strict timeouts on all outbound HTTP/WS calls | Abort request, retry with backoff | Low | Medium | Minimal |
| Sandbox Resource Exhaustion | Infinite loop in agent-generated code | Sandbox CPU/RAM/timeout ceiling hit | Container/process resource limits | Kill sandbox, record failure artifact | Medium | Medium | Minimal |
