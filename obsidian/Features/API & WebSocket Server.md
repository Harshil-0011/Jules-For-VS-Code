---
title: "API & WebSocket Server"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "api"
  - "gateway"
  - "websocket"
  - "outbox"
aliases:
  - "API Server"
  - "WebSocket Server"
  - "REST Gateway"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Features/Task & Queue Management]]"
  - "[[Features/Frontend UI]]"
confidence: "high"
---

# API & WebSocket Server Feature Specification

## 1. System Overview

The **API & WebSocket Server** subsystem provides the primary HTTP REST API Gateway, real-time WebSocket event broadcasting, and transactional Outbox/Inbox messaging infrastructure for client communications.

Client applications (**Jules Extension**, **Jules Coding IDE**, **Jules Code CLI**) communicate with the platform control plane exclusively through these documented network interfaces.

---

## 2. Key Components

1. **REST API Gateway** (`server/api/gateway.ts`):
   - Express v4 server exposing REST endpoints:
     - `GET /api/v1/tasks`: Query task list from SQLite.
     - `POST /api/v1/tasks`: Create new autonomous task.
     - `POST /api/v1/emergency-stop`: Trigger global emergency stop.
     - `POST /api/v1/emergency-stop/reset`: Reset emergency stop.
     - `POST /api/v1/tasks/:id/merge`: Trigger Merge Coordinator evaluation.
2. **WebSocket Event Stream Server** (`server/events/websocket_server.ts`):
   - `ws` WebSocket server mounted on path `/events`.
   - Broadcasts real-time system events (`type`, `payload`, `timestamp`) to connected client UIs.
3. **Transactional Outbox & Inbox Services** (`server/events/outbox.ts`):
   - `OutboxService`: Publishes events atomically inside database transactions (`PENDING` state).
   - `InboxService`: Guarantees idempotent consumer processing by deduplicating event IDs.

---

## 3. Sequence Flow Diagram

```text
CLIENT UI               REST GATEWAY             OUTBOX SERVICE             WEBSOCKET SERVER
    │                         │                         │                         │
    │ POST /api/v1/tasks      │                         │                         │
    ├────────────────────────►│                         │                         │
    │                         │ publishInTransaction()  │                         │
    │                         ├────────────────────────►│                         │
    │                         │                         │ INSERT outbox (PENDING) │
    │                         │                         ├──────────────┐          │
    │                         │                         │              │          │
    │                         │                         ◄──────────────┘          │
    │ 201 Created {taskId}    │                         │                         │
    ◄─────────────────────────┤                         │                         │
    │                         │                         │                         │
    │                         │ processOutbox(handler)  │                         │
    │                         ├────────────────────────►│                         │
    │                         │                         │ broadcast(event)        │
    │                         │                         ├────────────────────────►│
    │                         │                         │                         │  JSON event
    │                         ◄─────────────────────────┴─────────────────────────┼───────────►
```

---

## 4. Subsystem Configuration

Managed via Zod configuration schema (`server/api/config.ts`):

| Config Field | Environment Variable | Default Value | Purpose |
|---|---|---|---|
| `port` | `PORT` | `3000` | Network port for HTTP Express server and WebSocket listener. |
| `jwtSecret` | `JWT_SECRET` | `super-secret...` | HMAC secret for verifying client JWT authorization headers. |

---

## 5. Known Issues & Edge Cases

1. **Disconnection During Outbox Flush**: If a WebSocket client disconnects mid-stream, broadcasts drop silently for that client. Clients must re-query `GET /api/v1/tasks` upon reconnecting.
2. **Outbox Polling Overhead**: High-frequency outbox polling can increase SQLite database lock contention; managed by batching outbox reads to 50 records per batch.

---

## 6. Related Notes
- [[Features/Frontend UI]] — VS Code extension event client integration.
- [[Features/Task & Queue Management]] — Command Bus transactional execution.
- [[Features/Database]] — Outbox and Inbox database schema tables.
