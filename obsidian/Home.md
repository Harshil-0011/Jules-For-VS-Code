---
title: "Jules Ecosystem Documentation Vault"
type: "hub"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "hub"
  - "jules"
  - "documentation"
  - "overview"
aliases:
  - "Home"
  - "Main Hub"
links:
  - "[[README]]"
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

# Welcome to the Jules Ecosystem Documentation Vault

> **Jules-First Autonomous Software Engineering Ecosystem**
> Putting Google Jules at the center of a controlled multi-product development system.

---

## 🚀 At-A-Glance Summary

The **Jules Ecosystem** consists of three independent products sharing a deterministic control plane, core SDKs, and verification tooling:

1. **Jules Extension**: Bring Jules directly into existing VS Code environments.
2. **Jules Coding IDE**: A standalone AI-native IDE centered around Jules agent teams.
3. **Jules Code CLI**: A terminal-first autonomous coding agent (`jules` CLI).

### System Priority Hierarchy
All engineering decisions, trade-offs, and runtime policy evaluations strictly follow this hierarchy:

```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

---

## 📌 Primary Navigation

| Core Vault Section | Description | Link |
|---|---|---|
| **Documentation Index** | Master index table of all notes | [[README]] |
| **Project Overview** | Goals, philosophy, tech stack & line count stats | [[Project Overview]] |
| **System Architecture** | Multi-product boundaries, ASCII graphs & flows | [[Architecture]] |
| **Problems & Solutions** | Solved architectural issues, open items & FMEA | [[Problems & Solutions]] |
| **Current Status** | Verification rollout, phase status & active tasks | [[Current Status]] |
| **Vision & Roadmap** | 11-Phase canonical development roadmap & non-goals | [[Vision & Roadmap]] |
| **Getting Started** | System prerequisites, installation & configuration | [[Getting Started]] |
| **Memory System** | Multi-scope context memory & SQLite storage | [[Memory System]] |
| **Feature Index** | Complete listing of all 15 system feature notes | [[Features/Index]] |

---

## ⚡ Quick Access Features

- [[Features/LLM Integration]] — Google Jules `v1alpha` session adapter & multi-agent orchestrator.
- [[Features/Security]] — Zero Trust policy engine, sandboxed broker, risk classification & secret redaction.
- [[Features/Verification & Merge Engine]] — Independent claim verification (`npm run build`, `npm test`) & Merge Coordinator.
- [[Features/API & WebSocket Server]] — Express REST API gateway & real-time WebSocket event broadcaster.
- [[Features/Task & Queue Management]] — Durable task lifecycle models, Priority Queue & Command Bus.
- [[Features/Execution & Leases]] — Lease fencing manager, sandboxed tool broker & multi-level budget enforcement.
- [[Features/Frontend UI]] — VS Code extension entry point, workspace adapters & command handlers.
- [[Features/Git & GitHub Integration]] — Isolated Git branch manager, HEAD base commit validation & GitHub provider.

---

## 🛠 Vault Formatting & Conventions
- All internal cross-references use Obsidian wikilinks: `\[\[Note Name\]\]` or `\[\[Folder/Note\]\]`.
- Example wikilinks in text are escaped as `\[\[example\]\]`.
- All notes contain standard YAML frontmatter for searchability and metadata tracking.
