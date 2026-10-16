# Jules Ecosystem - Comprehensive Usage & Installation Guide

Detailed guide for installing, configuring, and operating the three independent products in the **Jules Ecosystem**: **Jules Code CLI**, **Jules Extension**, and **Jules Coding IDE**.

---

## ⚙️ Platform Prerequisites & Runtime Dependencies

| Requirement | Supported Version | Notes |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.0.0` | Required for running CLI, IDE shell, and Platform Gateway server |
| **npm / yarn / pnpm** | `npm >= 10.0.0` | Node Package Manager for installing dependencies |
| **Build Tools** | `gcc`, `g++`, `make`, `python3` | Required for compiling native C++ bindings (`better-sqlite3`) |
| **Git** | `>= 2.30.0` | Required for git workspace inspection and PR creation |
| **VS Code Engine** | `^1.85.0` | Required only when using **Jules Extension** |

---

## 1️⃣ Jules Code CLI (Terminal-First Agent)

The `jules` CLI is an autonomous coding agent with custom rules, context tagging, and cost tracking.

### Features & Capabilities

- **Custom Rules (`.julesrules`)**: Place a `.julesrules` file in your repository root to enforce system instructions and policy rules.
- **Context Tagging (`@file`)**: Pass `@filepath` directly in prompts to automatically load and attach file contents to the session context.
- **Slash Commands**:
  - `/help` — Display command guide
  - `/status` — Inspect git branch and custom `.julesrules` status
  - `/diff` — Inspect active workspace uncommitted git diffs
  - `/cost` — Show token consumption and estimated execution cost ($ USD)
  - `/rollback` — Revert workspace changes to prior checkpoint
  - `/mode <mode>` — Switch permission modes (`AUTO`, `ASK`, `READ_ONLY`, `CI`)
  - `/session list` — View session history and token metrics
  - `/sources` — List connected Jules cloud sources

### Usage Modes

```bash
# 1. Interactive Shell with @file context
jules
jules (auto)> refactor authentication in @src/auth/service.ts

# 2. Single Task Mode
jules "fix failing test in auth module @tests/unit/auth.test.ts"

# 3. Exec Mode with Custom Task
jules exec "implement JWT authentication"

# 4. Code Review Mode (READ_ONLY Policy)
jules review

# 5. Token Cost & Metrics Check
jules (auto)> /cost
```

---

## 2️⃣ Jules Coding IDE (Standalone AI-Native IDE)

A ground-up standalone AI IDE with integrated editor, file tree, terminal, web preview browser, symbol indexer, checkpoint manager, and multi-agent team orchestrator.

### Modern AI Features

- **Symbol Indexer**: Indexes workspace AST symbols (functions, classes, interfaces, types) for instant agent context lookups.
- **Multi-Agent Debate**: Orchestrates consensus reviews between Lead Architect agents and Security Reviewer agents before code application.
- **Workspace Checkpoints**: Automatically creates revertable state checkpoints before agent workspace mutations.

---

## 3️⃣ Jules Extension for VS Code

Brings Jules autonomous agent sessions directly into your existing VS Code environment.

---

## 4️⃣ Environment Variables & Gateway Configuration

| Variable | Description | Default |
|---|---|---|
| `PORT` | Platform Gateway API & WebSocket port | `3000` |
| `DB_PATH` | SQLite database file path | `./jules_platform.db` |
| `JULES_API_KEY` | Google Jules Endpoint API Key | `mock-jules-key` |
| `JULES_API_URL` | Google Jules API Endpoint | `https://jules.googleapis.com/v1alpha` |
| `GITHUB_TOKEN` | GitHub API Token | `mock-github-token` |
| `EMERGENCY_STOP` | Global emergency stop kill switch | `false` |
