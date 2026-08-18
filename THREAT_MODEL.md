# Threat Model

| Threat ID | Threat | Attack Surface | Mitigation | Detection | Recovery |
|---|---|---|---|---|---|
| T-01 | Prompt Injection | Untrusted repo README/issue files | Strict trust hierarchy; prompt boundary tags | Tool call anomaly monitoring | Task cancellation & workspace reset |
| T-02 | Stale Worker Write | Crashed worker post-lease write | Monotonic lease fencing tokens | DB fencing rejection logs | Discard stale write |
| T-03 | Secret Exfiltration | Agent reading `.env` | Default `NETWORK=DENY`; secret scanner | Secret match alerts in audit log | Revoke credential & kill session |
| T-04 | Malicious Dependency | Adding compromised npm package | Supply-chain scanner; HIGH risk escalation | Risk Engine dependency scanner | Require human approval gate |
| T-05 | Arbitrary Code Execution | Host shell exploit | Sandboxed Execution Broker; non-root user | Sandbox boundary alerts | Terminate sandbox instance |
