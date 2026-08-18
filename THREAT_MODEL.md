# Threat Model

System security and threat mitigations are prioritized according to:
```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

| Threat ID | Threat | Attack Surface | Mitigation | Detection | Recovery | Residual Risk |
|---|---|---|---|---|---|---|
| T-01 | Prompt Injection | Repo README/issues containing malicious agent instructions | Strict Trust Hierarchy; prompt isolation; static boundary tags | Pattern anomaly monitoring in tool calls | Cancel task, reset workspace | Low |
| T-02 | Stale Worker Write | Crashed worker waking up after lease expiration | Lease fencing tokens on all state mutations | DB fencing rejection logs | Discard stale write | Minimal |
| T-03 | Secret Exfiltration | Agent reading `.env` and printing/sending to remote server | Default `NETWORK=DENY`; automated secret scanner on all outputs | Secret match alerts in audit log | Revoke credential, kill session | Low |
| T-04 | Malicious Dependency Addition | Agent adding compromised npm/pip package | Supply-chain scanner; lockfile analysis; HIGH risk escalation | Risk Engine dependency diff scanner | Require human approval | Medium |
| T-05 | Arbitrary Code Execution on Host | Agent executing `rm -rf /` or host exploit via shell tool | Sandboxed execution broker; non-root user; restricted syscalls | Container/broker boundary checks | Kill sandbox instance | Low |
| T-06 | WebSocket Auth Bypass | Unauthenticated user sending control plane commands | JWT authentication on connection handshakes | Auth failure logging | Close connection | Low |
| T-07 | Stale Base Commit Patch Apply | Merging agent changes onto a branch that evolved concurrently | Base commit mismatch check before applying patches | Git base tree verification failure | Force rebase & re-verify | Low |
