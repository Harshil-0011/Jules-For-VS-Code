# Failure Modes and Effects Analysis (FMEA)

| Failure Cause | Effect | Detection | Mitigation | Recovery |
|---|---|---|---|---|
| Jules API Outage | Jules calls fail | Circuit breaker opens; HTTP 5xx tracking | Exponential backoff & jitter | Resume session when provider comes online |
| Worker Process Crash | Interrupted execution | Lease heartbeat timeout | Database lease expiration | New worker acquires lease and resumes task |
| Database Partition | State update failure | DB connection pool error | Transactions rollback; fail closed | Re-establish connection & re-sync outbox |
| Git Merge Conflict | Cannot merge PR | Git merge conflict detection | Verification Engine flags conflict | Rebase branch or request human review |
| Sandbox Exhaustion | Resource limit hit | Resource ceiling breach | Process CPU/RAM/timeout limits | Terminate sandbox and record failure artifact |
