# Jules Autonomous Engineering Ecosystem

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/Harshil-0011/Jules-For-VS-Code/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-blue.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/platform-VS%20Code%20%7C%20IDE%20%7C%20CLI-blueviolet)](https://github.com/Harshil-0011/Jules-For-VS-Code)

> **Jules-first autonomous software engineering ecosystem**

A production-oriented autonomous software engineering platform putting **Google Jules at the center of a controlled multi-product development system**.

---

## 📦 Ecosystem Products & Downloads

The ecosystem offers **three independent products**. Select and download the product suited for your workflow:

| Product | Form Factor | Direct Download / Install Link | Documentation |
| :--- | :--- | :--- | :--- |
| **1. Jules Extension** | VS Code Extension (`.vsix`) | [Download `jules-extension.vsix`](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/jules-extension.vsix) \| [VS Marketplace](https://marketplace.visualstudio.com/items?itemName=jules-ecosystem.jules-extension) | [`apps/jules-extension`](./apps/jules-extension) |
| **2. Jules Coding IDE** | Standalone AI IDE App | [Download Desktop IDE (Linux/macOS/Win)](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest) | [`apps/jules-ide`](./apps/jules-ide) |
| **3. Jules Code CLI** | Terminal Coding Agent | [`npm install -g jules-code-cli`](https://www.npmjs.com/package/jules-code-cli) \| [Download CLI Binary](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/jules-cli) | [`apps/jules-cli`](./apps/jules-cli) |

---

## 📸 Application Interface Previews

### 1️⃣ Jules Extension for VS Code (Sidebar & Diff View)

Integrates autonomous Jules agent panels directly into your existing VS Code workspace.

```text
+---------------------------------------------------------------------------------------------------+
|  VS CODE WORKSPACE  [Jules Autonomous Extension v4.0.0]                                           |
+------------------------+------------------------------------+-------------------------------------+
| JULES EXTENSION PANEL  | EDITOR: src/auth/service.ts        | JULES DIFF & APPROVAL VIEW          |
|                        |                                    |                                     |
| [Active Task]          |  export async function verifyToken | - const isValid = false;            |
|  Fix auth token exp    |  (token: string) {                 | + const isValid = await verifyExp();|
|                        | -  return false;                   |                                     |
| [Activity Stream]      | +  return jwt.verify(token);       | [Status: VERIFICATION_PASSED]       |
|  - [09:12] Interpret   |  }                                 |                                     |
|  - [09:13] Inspect Git |                                    | [ Approve Plan ]  [ Take Over ]     |
|  - [09:14] Plan Ready  |------------------------------------| [ Emergency Stop 🛑 ]               |
|                        | TERMINAL: npm test                 |                                     |
| [Chat Prompt]          |  PASS  tests/unit/auth.test.ts     |                                     |
| > Fix token exp bug    |  Test Suites: 13 passed, 13 total  |                                     |
+------------------------+------------------------------------+-------------------------------------+
```

### 2️⃣ Jules Coding IDE (Standalone AI-Native Desktop App)

A ground-up standalone AI IDE with integrated file tree, multi-buffer editor, terminal, git workspace, diagnostics, web preview browser, and multi-agent team orchestrator.

```text
+---------------------------------------------------------------------------------------------------+
| JULES CODING IDE v4.0.0 — [Project: Jules-Ecosystem | Branch: main]                               |
+--------------+----------------------------------+-----------------------------+-------------------+
| FILE TREE    | CODE EDITOR: server/gateway.ts   | DIAGNOSTICS & WEB PREVIEW   | AGENT TEAM PANEL  |
|              |                                  |                             |                   |
| > apps/      |  const app = express();          | [Diagnostics View]          | [Active Agents]   |
|   > cli/     |  app.use(express.json());        |  ✓ 0 Errors                 |  - Jules Lead     |
|   > ide/     |  app.post("/v1/task", async req) |  ✓ 0 Warnings               |  - Sec Reviewer   |
|   > ext/     |  const res = await dispatch();   |                             |                   |
| > server/    |                                  | [Web Preview Browser]       | [Team Workflow]   |
|   index.ts   |----------------------------------|  http://localhost:3000      |  1. Interpret     |
| > tests/     | TERMINAL: node dist/server.js    |  [ Jules Gateway Running ]  |  2. Plan Approved |
|   auth.ts    |  Server listening on port 3000   |                             |  3. Verified      |
+--------------+----------------------------------+-----------------------------+-------------------+
```

### 3️⃣ Jules Code CLI (Terminal-First Autonomous Shell)

Terminal-first autonomous coding shell supporting slash commands, policy checks, interactive REPLs, and headless CI runs.

```text
+---------------------------------------------------------------------------------------------------+
| JULES CODE CLI TERMINAL REPL                                                                      |
+---------------------------------------------------------------------------------------------------+
|  =====================================================                                            |
|    JULES CODE CLI — Interactive Autonomous Shell                                                  |
|    Powered by Google Jules & Gemini Pro                                                           |
|  =====================================================                                            |
|  Workspace: /app | Branch: main | Permission Mode: AUTO                                           |
|                                                                                                   |
|  jules (auto)> fix failing test in auth module                                                    |
|  [INTERPRET] Processing task: "fix failing test in auth module"                                   |
|  [INSPECT] Repository: app | Branch: main | PM: npm                                                   |
|  [PLAN] Jules Plan: 1. Connect source -> 2. Generate changes -> 3. Run verification               |
|  [EXECUTE] Executing task via Jules Cloud VM Session                                              |
|  [OBSERVE] Edits applied successfully to repository workspace                                    |
|  [VERIFY] Executing build and test verification suite                                             |
|  [COMPLETE] Task finished with status PASSED                                                      |
|                                                                                                   |
|  jules (auto)> _                                                                                  |
+---------------------------------------------------------------------------------------------------+
```

---

## 🛠️ Prerequisites & Requirements

To run or compile the Jules Ecosystem, satisfy the following runtime requirements based on your chosen product:

### Core Platform Requirements
- **Node.js**: `>= 20.0.0` (LTS recommended)
- **Package Manager**: `npm >= 10.0.0` or `yarn` / `pnpm` / `bun`
- **Native C++ Build Tools** (Required for SQLite `better-sqlite3` compilation):
  - **Linux**: `gcc`, `g++`, `make`, `python3` (`sudo apt install build-essential python3`)
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Windows**: Windows Build Tools or Visual Studio C++ Workload (`npm install --global windows-build-tools`)

### Product-Specific Requirements
1. **Jules Extension**:
   - VS Code Engine: `^1.85.0` or later
   - Permissions: Workspace read/write access
2. **Jules Coding IDE**:
   - Standalone Desktop Runtime: Node.js 20+ / Electron shell support
   - Supported OS: macOS (11.0+), Linux (Ubuntu 20.04+, Debian 11+), Windows (10/11 x64)
3. **Jules Code CLI**:
   - Terminal/Shell: `bash`, `zsh`, `fish`, or PowerShell
   - Git: `git >= 2.30.0` installed and in PATH

---

## ⚙️ Detailed Installation & Setup

### 1️⃣ Installing Jules Extension for VS Code

Integrates autonomous agent sessions directly into your VS Code editor.

* **Option A: Direct VSIX Install**
  1. Download [jules-extension.vsix](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/jules-extension.vsix).
  2. Install via command line:
     ```
     code --install-extension jules-extension.vsix
     ```
  3. Or in VS Code: Press `Ctrl+Shift+P` (or `Cmd+Shift+P`), select **Extensions: Install from VSIX...**, and choose the downloaded file.

* **Option B: Visual Studio Marketplace**
  Search for `Jules Extension` in the VS Code Extensions tab (`Ctrl+Shift+X`) and click **Install**.

### 2️⃣ Installing Jules Coding IDE

A full standalone AI-native IDE environment with integrated editor, file tree, terminal, git view, diagnostics, web preview, and team panel.

* **macOS**: Download [Jules-IDE-macOS.dmg](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/Jules-IDE-macOS.dmg), open the disk image, and drag **Jules Coding IDE** to your `Applications` folder.
* **Linux**: Download [Jules-IDE-Linux.AppImage](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/Jules-IDE-Linux.AppImage), mark executable, and launch:
  ```
  chmod +x Jules-IDE-Linux.AppImage
  ./Jules-IDE-Linux.AppImage
  ```
* **Windows**: Download and run [Jules-IDE-Setup.exe](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/Jules-IDE-Setup.exe) to install.

### 3️⃣ Installing Jules Code CLI

A terminal-first agent capable of running tasks, PR generation, interactive REPLs, and CI pipelines.

* **Option A: NPM Global Package**
  ```
  npm install -g jules-code-cli
  jules --help
  ```

* **Option B: Standalone Terminal Binary**
  ```
  curl -fsSL https://raw.githubusercontent.com/Harshil-0011/Jules-For-VS-Code/main/install-cli | env RUN_INSTALLER=1
  ```

---

## ⚡ Developer Quickstart & Building from Source

To build all products and the backend platform from source:

```
# 1. Clone the repository
git clone https://github.com/Harshil-0011/Jules-For-VS-Code.git
cd Jules-For-VS-Code

# 2. Install dependencies & compile native modules
npm install

# 3. Build all TypeScript projects
npm run build

# 4. Run full unit and integration test suite
npm test
```

### Running Products locally from Source

* **Run Jules Code CLI**:
  ```
  node dist/apps/jules-cli/index.js "fix tests in auth module"
  node dist/apps/jules-cli/index.js interactive
  ```
* **Run Jules Coding IDE Shell**:
  ```
  node -e "const ide = require(./dist/apps/jules-ide/index.js); ide.activateIDE();"
  ```
* **Run Jules Platform Gateway Server**:
  ```
  npm start
  ```

---

## 🔑 Architecture Principles & Features

> **Jules is the primary intelligence. The products are independent clients. The deterministic infrastructure controls execution.**

Strict Priority Hierarchy:
```text
CORRECTNESS > SAFETY > VERIFIABILITY > RELIABILITY > RECOVERABILITY > PERFORMANCE > COST > SPEED
```

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
