# Security Model

## 1. Security Principles
The Jules Ecosystem operates under a **Zero Trust for Untrusted Content** architecture governed by the strict system priority hierarchy:

```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

Repository code, issue descriptions, PR comments, and web sources are untrusted data. Repository content CANNOT override system security policy.

---

## 2. Tool Execution & Sandboxing
All dangerous tool executions pass through the sandbox pipeline:

`Agent → Tool Request → Policy → Permission → Sandbox → Execution → Result`

Sandboxes enforce CPU, memory, process count, disk, filesystem, and network controls. Default Network Policy is `DENY`.

---

## 3. Credentials & Redaction
Agents receive scoped, short-lived tokens. Secret redaction scanners sanitize outputs, logs, events, artifacts, and context prior to persistence.

---

## 4. Emergency Stop
Independent global emergency stop halts execution broker operations and merges across all workers and products.
