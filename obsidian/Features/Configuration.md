---
title: "Configuration Feature Specification"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "config"
  - "zod"
  - "environment"
aliases:
  - "Configuration"
  - "Platform Config"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Getting Started]]"
  - "[[Features/Security]]"
confidence: "high"
---

# Configuration Feature Specification

## 1. System Overview

The **Configuration** subsystem manages platform settings, default parameters, and environment variable loading (`server/api/config.ts`).

It uses **Zod** schema validation to enforce strict type safety, sanitize inputs, and prevent startup when required parameters are invalid or missing.

---

## 2. Key Components

1. **`ConfigSchema`** (`server/api/config.ts`):
   - Zod object schema defining types, constraints, default values, and URL formats for all platform configuration variables.
2. **`loadConfig(overrides)`**:
   - Parses `process.env` variables, filters out undefined values, merges programmatic overrides, and executes `ConfigSchema.parse()`.
3. **`Config` Type**:
   - TypeScript static type inferred directly from `ConfigSchema` using `z.infer<typeof ConfigSchema>`.

---

## 3. Configuration Loading Sequence Flow

```text
SYSTEM STARTUP            LOADCONFIG()            PROCESS.ENV            ZOD CONFIGSCHEMA
      │                        │                      │                         │
      │ startServer()          │                      │                         │
      ├───────────────────────►│                      │                         │
      │                        │ Read Environment     │                         │
      │                        ├─────────────────────►│                         │
      │                        │                      │ Returns raw process.env │
      │                        │ Raw Env Object       ◄─────────────────────────┤
      │                        ├──────────────┐       │                         │
      │                        │ Filter       │       │                         │
      │                        │ undefineds   │       │                         │
      │                        ◄──────────────┘       │                         │
      │                        │                      │                         │
      │                        │ parse(merged)        │                         │
      │                        ├───────────────────────────────────────────────►│
      │                        │                      │                         │
      │                        │ Validated Config     │                         │
      │                        ◄────────────────────────────────────────────────┤
      │ App Initialized        │                      │                         │
      ◄────────────────────────┤                      │                         │
```

---

## 4. Complete Configuration Parameter Reference

| Parameter Name | Zod Type | Default Value | Environment Variable | Description |
|---|---|---|---|---|
| `port` | `z.number()` | `3000` | `PORT` | Network port for HTTP API Gateway and WebSocket stream server. |
| `dbPath` | `z.string()` | `./jules_platform.db` | `DB_PATH` | Path to SQLite database file. Set to `:memory:` for testing. |
| `nodeEnv` | `z.enum(['development', 'test', 'production'])` | `development` | `NODE_ENV` | Application runtime environment mode. |
| `julesApiKey` | `z.string()` | `mock-jules-key` | `JULES_API_KEY` | Google Jules API key. |
| `julesApiUrl` | `z.string().url()` | `https://jules.googleapis.com/v1alpha` | `JULES_API_URL` | Base URL for Google Jules `v1alpha` API. |
| `githubToken` | `z.string()` | `mock-github-token` | `GITHUB_TOKEN` | GitHub API access token for pull request operations. |
| `jwtSecret` | `z.string()` | `super-secret-default-key-change-in-prod` | `JWT_SECRET` | Secret key for signing authorization JWTs. |
| `emergencyStop` | `z.boolean()` | `false` | `EMERGENCY_STOP` | Initial global emergency stop activation flag. |

---

## 5. Known Issues & Edge Cases

1. **Invalid URL String for `julesApiUrl`**: If `JULES_API_URL` is set to an invalid URL string (e.g. `not-a-url`), Zod validation throws a fatal `ZodError` at startup, preventing startup with corrupted settings.
2. **Type Coercion for `PORT`**: Environment variables are always strings; `loadConfig` manually parses `process.env.PORT` via `parseInt(..., 10)` before handing off to Zod.

---

## 6. Related Notes
- [[Getting Started]] — Operational setup and environment configuration instructions.
- [[Features/Security]] — Use of `jwtSecret` and `emergencyStop` settings.
- [[Features/API & WebSocket Server]] — Server initialization using configuration objects.
