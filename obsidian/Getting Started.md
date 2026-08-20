---
title: "Getting Started Guide"
type: "guide"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "guide"
  - "getting-started"
  - "installation"
  - "configuration"
aliases:
  - "Getting Started"
  - "Installation Guide"
links:
  - "[[Home]]"
  - "[[Project Overview]]"
  - "[[Features/Configuration]]"
  - "[[Features/Testing]]"
confidence: "high"
---

# Getting Started Guide

## 1. System Requirements

Before running the **Jules Ecosystem**, ensure your host system satisfies the following requirements:

- **Node.js**: `v22.0.0` or higher (LTS recommended)
- **npm**: `v10.0.0` or higher
- **Git**: `v2.30.0` or higher installed in system PATH
- **C/C++ Build Toolchain**: Required for compiling `better-sqlite3` native bindings (`gcc`, `g++`, `make`, or `python3`)
- **Operating System**: Linux (Ubuntu 22.04+ / Debian 12+), macOS (12+), or Windows (WSL2 recommended)

---

## 2. Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jules-platform/jules-platform.git
   cd jules-platform
   ```

2. **Install Node dependencies**:
   ```bash
   npm ci
   ```

3. **Compile TypeScript project**:
   ```bash
   npm run build
   ```

4. **Execute test suite to verify installation**:
   ```bash
   npm test
   ```

---

## 3. Configuration & Environment Variables

System configuration is managed by Zod (`server/api/config.ts`) and loaded from environment variables with sensible development defaults:

| Variable | Type | Default Value | Description |
|---|---|---|---|
| `PORT` | Number | `3000` | HTTP REST API Gateway and WebSocket server port. |
| `DB_PATH` | String | `./jules_platform.db` | SQLite database file path. Use `:memory:` for ephemeral test instances. |
| `NODE_ENV` | Enum | `development` | Operating mode (`development`, `test`, `production`). |
| `JULES_API_KEY` | String | `mock-jules-key` | Google Jules API key for `v1alpha` endpoint access. |
| `JULES_API_URL` | URL | `https://jules.googleapis.com/v1alpha` | Google Jules service endpoint. |
| `GITHUB_TOKEN` | String | `mock-github-token` | GitHub API access token for PR creation and status checks. |
| `JWT_SECRET` | String | `super-secret-default-key-change-in-prod` | Secret key for signing client API JWTs. |
| `EMERGENCY_STOP` | Boolean | `false` | Global emergency stop flag halting all tool executions. |

### Example Environment File (`.env`)
```env
PORT=3000
DB_PATH=./jules_platform.db
NODE_ENV=development
JULES_API_KEY=your-actual-jules-api-key
JULES_API_URL=https://jules.googleapis.com/v1alpha
GITHUB_TOKEN=your-actual-github-token
JWT_SECRET=production-grade-random-secret-key
EMERGENCY_STOP=false
```

---

## 4. Running the Platform Server

To start the HTTP REST API Gateway and WebSocket event stream server:

```bash
npm start
```

Upon startup, the server output will indicate:
```text
Server running on port 3000
Database initialized at ./jules_platform.db (WAL mode)
WebSocket stream listening on /events
```

---

## 5. Database Backup & Management

The persistence layer uses SQLite with Write-Ahead Logging (WAL) enabled (`server/persistence/database.ts`).

### Creating a Hot Database Backup
Because WAL mode allows concurrent readers, you can safely create a backup copy of the database file while the server is running:

```bash
# Using SQLite CLI .backup command
sqlite3 ./jules_platform.db ".backup ./jules_platform_backup.db"
```

### Restoring from Backup
1. Stop the server process.
2. Overwrite `jules_platform.db` with your backup copy.
3. Remove stale WAL and shared memory files (`jules_platform.db-wal`, `jules_platform.db-shm`).
4. Restart the server process.

---

## 6. Verification & CLI Usage

### Running the Terminal Coding Agent (`jules` CLI)
```bash
# Interactive mode
npx ts-node server/index.ts

# Single task execution
jules "fix failing tests in context_engine.ts"

# Non-interactive headless execution (CI)
jules exec --task "Repair build failures" --non-interactive
```

---

## 7. Basic Troubleshooting

- **Native Module Compilation Error (`better-sqlite3`)**:
  - Run `npm rebuild better-sqlite3` or ensure `build-essential` is installed.
- **`Preset ts-jest not found`**:
  - Ensure you ran `npm ci` rather than `npm install --no-save`.
- **Database File Locked (`SQLITE_BUSY`)**:
  - Ensure WAL mode is enabled. Close duplicate server instances operating on the same file.

---

## 8. Related Notes
- [[Project Overview]] — Tech stack overview.
- [[Features/Configuration]] — Deep dive into configuration schemas.
- [[Features/Testing]] — Guide to running unit, integration, and concurrency tests.
