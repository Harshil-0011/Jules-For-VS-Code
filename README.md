# Jules Autonomous Engineering Ecosystem

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/Harshil-0011/Jules-For-VS-Code/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-blue.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/platform-VS%20Code%20%7C%20IDE%20%7C%20CLI-blueviolet)](https://github.com/Harshil-0011/Jules-For-VS-Code)

> **Jules-first autonomous software engineering ecosystem**

A production-oriented autonomous software engineering platform putting **Google Jules at the center of a controlled multi-product development system**.

---

## 📦 Downloads & Installation

The ecosystem offers **three independent products**. Select and download the product suited for your workflow:

| Product | Form Factor | Download / Install Link | Documentation |
| :--- | :--- | :--- | :--- |
| **1. Jules Extension** | VS Code Extension (`.vsix`) | [Download VSIX Package](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/jules-extension.vsix) \| [VS Marketplace](https://marketplace.visualstudio.com/items?itemName=jules-ecosystem.jules-extension) | [`apps/jules-extension`](./apps/jules-extension) |
| **2. Jules Coding IDE** | Standalone AI IDE App | [Download Desktop IDE (Linux/macOS/Win)](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest) | [`apps/jules-ide`](./apps/jules-ide) |
| **3. Jules Code CLI** | Terminal Coding Agent | [`npm install -g jules-code-cli`](https://www.npmjs.com/package/jules-code-cli) \| [Download CLI Binary](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/jules-cli) | [`apps/jules-cli`](./apps/jules-cli) |

---

### 1️⃣ Download: Jules Extension for VS Code
Bring Jules into your existing VS Code environment.

* **Direct VSIX Download**: [jules-extension.vsix](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/jules-extension.vsix)
* **VS Code Marketplace**: [Install from Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=jules-ecosystem.jules-extension)
* **Quick Install Command**:
  ```
  code --install-extension jules-extension.vsix
  ```

### 2️⃣ Download: Jules Coding IDE
A standalone AI-native coding environment built ground-up around Jules autonomous agents.

* **macOS App (.dmg)**: [Download for macOS](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/Jules-IDE-macOS.dmg)
* **Linux AppImage (.AppImage)**: [Download for Linux](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/Jules-IDE-Linux.AppImage)
* **Windows Installer (.exe)**: [Download for Windows](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/Jules-IDE-Setup.exe)

### 3️⃣ Download: Jules Code CLI
A terminal-first autonomous coding agent (similar to Claude Code / Codex CLI).

* **NPM Installation**:
  ```
  npm install -g jules-code-cli
  ```
* **Standalone Terminal Binary**:
  ```
  curl -fsSL https://raw.githubusercontent.com/Harshil-0011/Jules-For-VS-Code/main/install-cli | env RUN_INSTALLER=1
  ```

---

## 🏗️ Architecture Principle

> **Jules is the primary intelligence. The products are independent clients. The deterministic infrastructure controls execution.**

When design choices conflict, decisions strictly follow this priority hierarchy:

```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

### Ecosystem System Topology

```text
                         JULES ECOSYSTEM
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
 ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
 │ JULES EXTENSION │  │   JULES IDE     │  │ JULES CODE CLI  │
 │                 │  │                 │  │                 │
 │ Existing IDE    │  │ Standalone      │  │ Terminal-first  │
 │ integration     │  │ AI coding IDE   │  │ coding agent    │
 └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
                    SHARED PROTOCOLS/LIBRARIES
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
      Jules SDK          Agent Protocol       Core Tooling
      Git Engine         Task Protocol        Verification
      Security           Context              Sandbox
      GitHub             Artifacts            Policies
                               │
                               ▼
                         GOOGLE JULES
```

---

## ⚡ Quick Start

### Building from Source

To build all three products from source:

```
# Clone the repository
git clone https://github.com/Harshil-0011/Jules-For-VS-Code.git
cd Jules-For-VS-Code

# Install dependencies
npm install

# Build TypeScript outputs
npm run build

# Run unit & integration test suites
npm test
```

### Launching the Products locally

* **Launch Jules Code CLI**:
  ```
  npm run build
  node dist/apps/jules-cli/index.js
  ```
* **Start Jules Gateway Server**:
  ```
  node dist/server/index.js
  ```

---

## 🔑 Key Features

- **Three Independent Products**: Extension, Coding IDE, and Code CLI run independently without cross-product dependencies.
- **Terminal Coding Agent**: `jules` CLI supports interactive, task execution, headless, CI, review, and verification modes.
- **Bounded Agent Loop**: Interpret → Inspect → Plan → Policy Check → Execute → Observe → Verify → Repair.
- **Independent Claim Verification**: Code claims are independently executed (`npm run build`, `npm test`) before merge.
- **Zero Trust Security Boundary**: Sandboxed Execution Broker, default DENY network policy, and secret redaction.

---

## 📚 Documentation Index

- [`USAGE.md`](./USAGE.md) — Product usage and command references.
- [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) — Security policy and sandboxing.
- [`THREAT_MODEL.md`](./THREAT_MODEL.md) — Threat matrix and mitigations.
- [`FAILURE_MODES.md`](./FAILURE_MODES.md) — FMEA and recovery strategies.
- [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md) — Implementation rollout status.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Detailed system architecture.
- [`FINAL_ARCHITECTURE.md`](./FINAL_ARCHITECTURE.md) — Final architectural blueprints.
- [`ARCHITECTURE_AUDIT.md`](./ARCHITECTURE_AUDIT.md) — Architectural inspection and product boundaries.

---

## 📄 License

This project is licensed under the MIT License — see the [`LICENSE`](./LICENSE) file for details.
