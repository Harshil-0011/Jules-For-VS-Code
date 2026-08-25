---
title: "Documentation Vault Index Table"
type: "index"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "index"
  - "readme"
  - "navigation"
aliases:
  - "Vault Index"
  - "README"
links:
  - "[[Home]]"
  - "[[Project Overview]]"
  - "[[Architecture]]"
  - "[[Problems & Solutions]]"
  - "[[Current Status]]"
  - "[[Vision & Roadmap]]"
  - "[[Getting Started]]"
  - "[[Memory System]]"
  - "[[Features/Index]]"
confidence: "high"
---

# Jules Ecosystem Documentation Index

This table lists every document present in the **Jules Ecosystem** Obsidian vault.

---

## 🏛 Core System Notes

| Document Title | Category | Description | Wikilink |
|---|---|---|---|
| **Home** | Hub Page | At-a-glance summary, primary navigation, and quick links. | [[Home]] |
| **README** | Index Table | Master index table of all notes in the vault. | [[README]] |
| **Project Overview** | Overview | System goals, philosophy, tech stack, and component stats table. | [[Project Overview]] |
| **Architecture** | Architecture | Canonical Version 4.0 architecture, product boundaries, dependency graph, request flows, and concurrency models. | [[Architecture]] |
| **Problems & Solutions** | Troubleshooting | Solved architectural issues, open problems matrix, troubleshooting playbook, and FMEA. | [[Problems & Solutions]] |
| **Current Status** | Project Status | Completed components, verified test suite results, and phase rollout status. | [[Current Status]] |
| **Vision & Roadmap** | Roadmap | Phased 11-stage development roadmap, long-term vision, and non-goals. | [[Vision & Roadmap]] |
| **Getting Started** | Operations Guide | Setup prerequisites, environment configuration, database management, and execution instructions. | [[Getting Started]] |
| **Memory System** | Memory Architecture | Context Engine, multi-scope memory (`GLOBAL`, `PROJECT`, `TASK`), SQLite schemas, and provenance tracking. | [[Memory System]] |

---

## 📦 Feature Specifications (`Features/`)

| Feature Note | Module / Subsystem | Primary Function | Wikilink |
|---|---|---|---|
| **Feature Index** | Directory Index | Index listing for all 15 feature files. | [[Features/Index]] |
| **LLM Integration** | `server/jules/`, `server/providers/`, `server/teams/` | Jules `v1alpha` API adapter, `AgentProvider` boundary, and team orchestrator. | [[Features/LLM Integration]] |
| **API & WebSocket Server** | `server/api/`, `server/events/` | Express REST Gateway, WebSocket event stream server, and transactional Outbox/Inbox messaging. | [[Features/API & WebSocket Server]] |
| **Frontend UI** | `vscode/extension/` | VS Code Extension entry point, workspace adapters, commands, and webviews. | [[Features/Frontend UI]] |
| **Configuration** | `server/api/config.ts` | Zod schema validation, environment variables, and default platform settings. | [[Features/Configuration]] |
| **Security** | `server/policies/`, `server/execution/` | Zero Trust model, Sandboxed Execution Broker, Risk Engine, Policy Engine, and secret redaction. | [[Features/Security]] |
| **Database** | `server/persistence/database.ts` | Better-SQLite3 WAL mode configuration, schema migrations, and relational integrity. | [[Features/Database]] |
| **Scheduler** | `server/scheduler/`, `server/workflows/` | Topological DAG Scheduler, cycle detection, failure propagation, and Workflow Engine step state machine. | [[Features/Scheduler]] |
| **Logging** | `server/observability/logger.ts` | Structured JSON logging, metadata tracking, trace IDs, and audit log persistence. | [[Features/Logging]] |
| **Testing** | `tests/` | Jest unit, integration, concurrency, and security test suites. | [[Features/Testing]] |
| **Deployment & Packaging** | `package.json`, `tsconfig.json` | TypeScript compilation, build pipeline, and independent product packaging models. | [[Features/Deployment & Packaging]] |
| **Task & Queue Management** | `server/tasks/`, `server/queues/`, `server/commands/` | Task models, Priority Queue Manager, and Command Bus. | [[Features/Task & Queue Management]] |
| **Execution & Leases** | `server/execution/` | Sandboxed tool execution, Lease Fencing Manager, and multi-level Budget Manager. | [[Features/Execution & Leases]] |
| **Git & GitHub Integration** | `server/git/`, `server/github/` | Workspace Git manager, HEAD base commit validation, and GitHub Provider integration. | [[Features/Git & GitHub Integration]] |
| **Verification & Merge Engine** | `server/verification/`, `server/merge/` | Independent claim verification (`npm run build`, `npm test`), evidence engine, and Merge Coordinator. | [[Features/Verification & Merge Engine]] |
| **Context Engine** | `server/context/context_engine.ts` | Context memory management, workspace discovery, and decision tracking. | [[Features/Context Engine]] |
