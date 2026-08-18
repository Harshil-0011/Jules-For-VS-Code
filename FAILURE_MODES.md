# Failure Modes and Effects Analysis (FMEA)

| Failure Cause | Effect | Detection | Mitigation | Recovery |
|---|---|---|---|---|
| Jules API Outage | Jules calls fail | Circuit breaker opens; 5xx rate monitoring | Exponential backoff and retry | Resume session when provider comes online |
| Worker Process Crash | Interrupted execution | Lease heartbeat timeout | Database lease expiration; clean worker pickup | New worker acquires lease and resumes task |
| Database Partition | State update failure | DB connection error | Transaction rollback; fail closed | Re-establish connection and re-sync outbox |
| Git Merge Conflict | Cannot merge changes | Git merge conflict detection | Flag conflict; mark task BLOCKED | Rebase branch or request human review |
| Sandbox Resource Exhaustion | Infinite loop in agent code | Resource ceiling breach | CPU/RAM/time limit enforced | Terminate sandbox and record failure artifact |
