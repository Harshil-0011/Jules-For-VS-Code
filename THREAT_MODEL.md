# Threat Model

| Threat ID | Threat | Attack Surface | Mitigation | Detection | Recovery |
|---|---|---|---|---|---|
| T-01 | Prompt Injection | Untrusted repo README/issue files | Strict trust hierarchy; prompt boundary isolation | Anomaly monitoring in tool requests | Task cancellation and workspace reset |
| T-02 | Stale Worker Write | Crashed worker attempting post-lease writes | Monotonic lease fencing tokens | Database fencing rejection | Discard stale write |
| T-03 | Secret Exfiltration | Agent attempting to leak credentials | Default `NETWORK=DENY`; automated secret scanner | Secret detection in audit log | Revoke credential and kill session |
| T-04 | Malicious Dependency | Adding vulnerable packages | Supply-chain scanner; Risk Engine HIGH risk escalation | Risk Engine dependency scanner | Require human approval gate |
| T-05 | Arbitrary Code Execution | Malicious shell execution | Sandboxed Execution Broker; non-root user | Container boundary alerts | Kill sandbox instance |
