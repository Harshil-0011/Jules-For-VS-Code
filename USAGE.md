# Jules Autonomous Engineering Platform - Usage Guide

This guide provides instructions for installing, configuring, running, and interacting with the Jules Autonomous Engineering Platform.

---

## 1. System Overview & Core Priority Hierarchy

The platform connects **VS Code**, **Coding IDE Interface**, **Coding CLI / Agent OS Shell**, **Google Jules**, **GitHub**, and sandboxed tools through a durable, policy-controlled orchestration control plane.

When design choices, performance optimizations, or operational tradeoffs conflict, system decisions MUST strictly follow this priority hierarchy:

```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

Key features:
- **Google Jules First**: Jules acts as the primary autonomous coding agent.
- **Durable Orchestration**: Task DAGs, workflow state machines, and transactional outbox/inbox messaging.
- **Independent Verification**: Automatic verification of agent claims via `npm test` and `npm run build`.
- **Policy & Security**: Sandboxed Execution Broker, secret redaction, and global Emergency Stop.
- **Git Isolation**: Isolated Git branch management and base commit collision prevention.

---

## 2. Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Installed and accessible on PATH

---

## 3. Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd jules-platform
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Build TypeScript Project**:
   ```bash
   npm run build
   ```

---

## 4. Configuration

Configure the platform using environment variables:

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP/WS Gateway Port | `3000` |
| `DB_PATH` | SQLite Database file path | `./jules_platform.db` |
| `NODE_ENV` | Environment (`development`, `test`, `production`) | `development` |
| `JULES_API_KEY` | Google Jules API Key | `mock-jules-key` |
| `JULES_API_URL` | Google Jules Endpoint | `https://jules.googleapis.com/v1alpha` |
| `GITHUB_TOKEN` | GitHub Access Token | `mock-github-token` |
| `JWT_SECRET` | Secret key for JWT auth | `super-secret-default-key` |
| `EMERGENCY_STOP` | Trigger global emergency stop on boot (`true`/`false`) | `false` |

---

## 5. Starting the Server

Start the control plane server:

```bash
npm start
```

The server listens on `http://localhost:3000` for REST API requests and `ws://localhost:3000/events` for real-time event streaming.

---

## 6. Running Tests

Run the comprehensive unit, integration, concurrency, and security test suite:

```bash
npm test
```

---

## 7. API Gateway Endpoints (`/api/v1`)

### Create a Task
`POST /api/v1/tasks`
```json
{
  "title": "Implement User Authentication",
  "description": "Add JWT auth endpoint and middleware",
  "riskLevel": "HIGH",
  "budget": {
    "maxRuntimeSec": 3600,
    "maxToolCalls": 50,
    "maxCostUsd": 5.0,
    "maxRetries": 3
  }
}
```

### List All Tasks
`GET /api/v1/tasks`

### Evaluate & Merge Task
`POST /api/v1/tasks/:id/merge`
```json
{
  "changeDescription": "Add JWT auth endpoint",
  "filesTouched": ["server/api/auth.ts"],
  "hasHumanApproval": true
}
```

### Trigger Emergency Stop
`POST /api/v1/emergency-stop`

### Reset Emergency Stop
`POST /api/v1/emergency-stop/reset`

---

## 8. User Interaction Surfaces

1. **VS Code Extension**: Access commands (`jules.newTask`, `jules.startTask`, `jules.emergencyStop`, etc.) from the command palette or sidebar.
2. **Coding IDE Interface**: Visual web-based IDE panel for reviewing DAG execution graph and approving high-risk changes.
3. **Coding CLI / Agent OS Shell**: CLI command interface to submit tasks and inspect verification evidence.

---

## 9. Real-time WebSocket Stream

Connect to `ws://localhost:3000/events` to stream live system events (task state transitions, agent activities, verification results).
