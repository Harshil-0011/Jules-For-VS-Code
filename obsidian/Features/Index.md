---
title: "Features Directory Index"
type: "index"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "features"
  - "index"
  - "components"
aliases:
  - "Feature Index"
  - "Features Index"
links:
  - "[[Home]]"
  - "[[README]]"
  - "[[Project Overview]]"
confidence: "high"
---

# System Features Index

This index categorizes all 15 individual feature documentation notes in the **Jules Ecosystem**. Each file details a single subsystem, including its components, sequence flows, configuration settings, known issues, and cross-references.

---

## 🤖 Intelligence & Agent Orchestration
- [[Features/LLM Integration]] — Google Jules `v1alpha` API session adapter, capability discovery, and multi-agent team orchestration (`TeamOrchestrator`).
- [[Features/Context Engine]] — Multi-scope context memory (`GLOBAL`, `PROJECT`, `TASK`), SQLite backing store, and prompt context augmentation.

---

## ⚡ Network, Server & Gateways
- [[Features/API & WebSocket Server]] — Express REST API Gateway (`/api/v1/tasks`, `/merge`), WebSocket event server (`/events`), and transactional Outbox/Inbox messaging.
- [[Features/Frontend UI]] — VS Code Extension client integration (`extension.ts`), workspace adapters, Git adapter, and UI views.

---

## 🛡 Security, Policy & Execution
- [[Features/Security]] — Zero Trust policy model, Sandboxed Execution Broker, Risk Engine classification, and secret redaction.
- [[Features/Execution & Leases]] — Command execution broker, Lease Fencing Manager with monotonic tokens, and multi-level Budget Manager.

---

## ⚙️ Core Platform Engine & Scheduling
- [[Features/Task & Queue Management]] — Task domain models, Priority Queue Manager, and transactional Command Bus.
- [[Features/Scheduler]] — Topological DAG Scheduler, cycle detection, failure propagation, and Workflow Engine step state machine.
- [[Features/Configuration]] — Zod schema validation, default settings, and environment variable overrides.

---

## 🔍 Quality Assurance, Verification & Merge
- [[Features/Verification & Merge Engine]] — Independent claim verification engine (`npm run build`, `npm test`), Evidence engine, and Merge Coordinator.
- [[Features/Git & GitHub Integration]] — Isolated Git workspace manager, HEAD base commit validation, and GitHub Provider integration.
- [[Features/Testing]] — Jest unit, integration, concurrency, and security testing framework.

---

## 🗄 Persistence, Observability & Deployment
- [[Features/Database]] — Better-SQLite3 WAL mode configuration, schema migrations, and relational integrity.
- [[Features/Logging]] — Structured JSON logger, trace correlation IDs, and audit log tracking.
- [[Features/Deployment & Packaging]] — TypeScript compilation, build scripts, and multi-product distribution model.
