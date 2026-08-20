---
title: "Logging & Observability"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "logging"
  - "observability"
  - "audit"
  - "tracing"
aliases:
  - "Logging"
  - "Observability"
  - "Audit Logging"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Features/Database]]"
  - "[[Features/Security]]"
confidence: "high"
---

# Logging & Observability Feature Specification

## 1. System Overview

The **Logging & Observability** subsystem provides structured JSON logging, trace correlation tagging, and audit log tracking for all platform events (`server/observability/logger.ts`).

By emitting logs as formatted JSON objects, the platform integrates with log aggregators (Elasticsearch, CloudWatch, Datadog) and preserves trace contexts (`taskId`, `agentId`, `tenantId`) across distributed async boundaries.

---

## 2. Key Components

1. **`Logger` Class** (`server/observability/logger.ts`):
   - Structured JSON logging class supporting log levels: `INFO`, `WARN`, `ERROR`, `DEBUG`.
   - Attaches global process metadata (`pid`, `hostname`) and contextual trace IDs to log outputs.
2. **Audit Logging Service (`audit_logs`)**:
   - Persists high-priority security decisions, policy enforcement actions, and merge evaluations in the SQLite `audit_logs` database table (`server/persistence/database.ts`).
3. **Trace Context Propagation**:
   - Tags log entries with `traceId`, `taskId`, `attemptId`, `executionId`, and `tenantId` to correlate requests.

---

## 3. Log Emission Flow Diagram

```text
CALLER / MODULE                LOGGER CLASS                STDOUT / CONSOLE          AUDIT_LOGS TABLE
       │                            │                             │                          │
       │ info("Task Started", meta) │                             │                          │
       ├───────────────────────────►│                             │                          │
       │                            │ Format JSON Payload         │                          │
       │                            ├──────────────┐              │                          │
       │                            │ Attach       │              │                          │
       │                            │ timestamp    │              │                          │
       │                            ◄──────────────┘              │                          │
       │                            │                             │                          │
       │                            │ console.log(json)           │                          │
       │                            ├────────────────────────────►│                          │
       │                            │                             │                          │
       │ logAudit(action, decision) │                             │                          │
       ├───────────────────────────►│                             │                          │
       │                            │                             │  INSERT INTO audit_logs  │
       │                            ├───────────────────────────────────────────────────────►│
```

---

## 4. Subsystem Configuration

Managed via environment variables:

| Setting | Variable | Default Value | Description |
|---|---|---|---|
| Environment Mode | `NODE_ENV` | `development` | In `test` mode, non-essential console outputs are suppressed. |

---

## 5. Sample Structured JSON Log Output

```json
{
  "level": "INFO",
  "message": "Tool executed successfully",
  "timestamp": "2026-08-20T10:30:00.000Z",
  "context": {
    "taskId": "task-001",
    "toolName": "shell",
    "redacted": true,
    "executionTimeMs": 142
  }
}
```

---

## 6. Known Issues & Edge Cases

1. **High Log Volume During Heavy Loops**: Detailed debug output during rapid tool execution loops can generate large log volumes; managed by adjusting logging levels in production.
2. **Secret Redaction Double-Check**: Even in logging streams, outputs containing raw tool outputs pass through secret redaction prior to `console.log()` dispatch.

---

## 7. Related Notes
- [[Features/Security]] — Secret redaction and policy audit logging.
- [[Features/Database]] — `audit_logs` table schema and indexing.
- [[Features/API & WebSocket Server]] — Real-time event broadcasting over WebSockets.
