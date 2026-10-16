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

## 1️⃣ Jules Code CLI

The `jules` CLI is a terminal-first autonomous coding agent.

### Installation Options

* **Via NPM Global Package**:
  ```
  npm install -g jules-code-cli
  ```
* **Via Standalone Binary**:
  ```
  curl -fsSL https://raw.githubusercontent.com/Harshil-0011/Jules-For-VS-Code/main/install-cli | env RUN_INSTALLER=1
  ```

### CLI Commands & Usage Modes

```
# 1. Interactive Shell (REPL)
jules

# 2. Single Task Mode
jules "fix the failing test in auth module"

# 3. Exec Mode with Custom Task
jules exec "implement JWT authentication"

# 4. Code Review Mode (Read-Only Policy)
jules review

# 5. Auto Repair / Fix Mode
jules fix

# 6. Headless / Non-Interactive CI Execution
jules exec --task "Fix failing test in auth module" --non-interactive
```

### Permission Modes

- `READ_ONLY`: Workspace modifications and tool executions are strictly forbidden.
- `ASK`: High-risk or mutating tool operations require user confirmation.
- `AUTO`: Permitted operations execute automatically within policy bounds.
- `CI`: Non-interactive execution for automated build and repair pipelines.

---

## 2️⃣ Jules Extension for VS Code

Brings Jules autonomous agent sessions directly into your existing VS Code environment.

### Installation Options

* **Direct VSIX Download**: Download [`jules-extension.vsix`](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/jules-extension.vsix) and run:
  ```
  code --install-extension jules-extension.vsix
  ```
* **VS Code Marketplace**: Search `Jules Extension` in the Extensions view (`Ctrl+Shift+X`) and install.

### Contributed VS Code Commands

- `jules.newTask` — Create a new Jules autonomous coding task
- `jules.startTask` — Start executing the current active task
- `jules.sendMessage` — Send a prompt message to the active Jules session
- `jules.assignGitHubIssue` — Dispatch a task derived from a GitHub issue
- `jules.versionBump` — Safely bump a package dependency version
- `jules.bugFix` — Dispatch an automated bug fix agent
- `jules.emergencyStop` — Immediately trigger global emergency stop

---

## 3️⃣ Jules Coding IDE

A standalone AI-native IDE integrating code editor, file explorer, search engine, terminal, Git workspace, diagnostics, web preview, task manager, and agent team panel.

### Platform Binaries & Installation

* **macOS (`.dmg`)**: Download [`Jules-IDE-macOS.dmg`](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/Jules-IDE-macOS.dmg) and move to `Applications`.
* **Linux (`.AppImage`)**: Download [`Jules-IDE-Linux.AppImage`](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/Jules-IDE-Linux.AppImage), grant execution permissions (`chmod +x`), and run.
* **Windows (`.exe`)**: Download and run [`Jules-IDE-Setup.exe`](https://github.com/Harshil-0011/Jules-For-VS-Code/releases/latest/download/Jules-IDE-Setup.exe).

---

## 4️⃣ Environment Variables & Gateway Configuration

| Variable | Description | Default |
|---|---|---|
| `PORT` | Platform Gateway API & WebSocket port | `3000` |
| `DB_PATH` | SQLite database file path (or `:memory:`) | `./jules_platform.db` |
| `JULES_API_KEY` | Google Jules Endpoint API Key | `mock-jules-key` |
| `JULES_API_URL` | Google Jules API Endpoint | `https://jules.googleapis.com/v1alpha` |
| `GITHUB_TOKEN` | GitHub API Token for repository access | `mock-github-token` |
| `EMERGENCY_STOP` | Global emergency stop kill switch | `false` |
