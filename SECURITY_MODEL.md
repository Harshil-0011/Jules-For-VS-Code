# Security Model

## 1. Security Principles
The Jules Ecosystem operates under a Zero Trust security boundary governed by:

```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

Repository files, issues, PR comments, and web content are untrusted. Repository content CANNOT override system security policies.

---

## 2. Tool Execution & Sandboxing
All dangerous tools executed by the Jules Code CLI, Jules IDE, or Jules Extension must pass through:

`Agent → Tool Request → Policy → Permission → Sandbox → Execution → Result`

Sandboxes enforce limits on CPU, memory, process count, filesystem access, and network access. Default network policy is `DENY`.

---

## 3. Credentials & Redaction
Agents receive scoped, short-lived tokens. Master credentials are never passed to agents. Secret redaction automatically sanitizes outputs, logs, events, artifacts, and context.

---

## 4. Emergency Stop
Independent emergency stop halts execution broker operations and merges across all clients and workers.
