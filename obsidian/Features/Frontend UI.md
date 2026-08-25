---
title: "Frontend UI & Extension"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "vscode"
  - "extension"
  - "ui"
  - "frontend"
aliases:
  - "Frontend UI"
  - "VS Code Extension"
  - "Extension UI"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Features/API & WebSocket Server]]"
  - "[[Features/Git & GitHub Integration]]"
confidence: "high"
---

# Frontend UI & Extension Feature Specification

## 1. System Overview

The **Frontend UI & Extension** subsystem provides the VS Code Extension client interface (`vscode/extension/extension.ts`). It brings Jules directly into existing IDE workspaces.

In accordance with system design principles, the Extension is a **lightweight client integration**. It owns workspace discovery, Git status discovery, command registration, and UI panel state, while delegating state authority to the platform backend.

---

## 2. Key Components

1. **Extension Entry Point (`activate` / `deactivate`)** (`vscode/extension/extension.ts`):
   - Registers extension commands and manages extension state (`connected`, `activeTaskId`, `emergencyStop`).
2. **`WorkspaceAdapter`**:
   - Inspects local workspace directory (`rootPath`, `projectName`, `hasGitRepo`, `packageManager`).
   - Ensures `.jules/` workspace directory exists and writes task state files (`.jules/${taskId}.json`).
3. **`GitAdapter`**:
   - Inspects local `.git/HEAD` file to discover active Git branch name and workspace cleanliness.
4. **`EventClient`**:
   - Maintains real-time connection to platform event streams and dispatches registered events.
5. **Command Registry**:
   - Exposes extension commands: `jules.newTask`, `jules.startTask`, `jules.addAgent`, `jules.approvePlan`, `jules.pauseTask`, `jules.takeOver`, `jules.verify`, `jules.emergencyStop`, `jules.getTaskView`, `jules.getDiffView`, `jules.getApprovalUI`.

---

## 3. Sequence Flow Diagram

```text
USER / VS CODE            EXTENSION API            WORKSPACE ADAPTER           PLATFORM GATEWAY
      │                          │                         │                          │
      │ jules.newTask(payload)   │                         │                          │
      ├─────────────────────────►│                         │                          │
      │                          │ discoverWorkspace()     │                          │
      │                          ├────────────────────────►│                          │
      │                          │                         │ Info: {hasGit, pm}       │
      │                          │                         ◄──────────────────────────┤
      │                          │ createTaskFile(id)      │                          │
      │                          ├────────────────────────►│                          │
      │                          │                         │ Writes .jules/task.json  │
      │                          │                         ◄──────────────────────────┤
      │                          │ POST /api/v1/tasks      │                          │
      │                          ├───────────────────────────────────────────────────►│
      │                          │                         │                          │
      │                          │ 201 Created             │                          │
      │                          ◄────────────────────────────────────────────────────┤
      │ Task View Updated        │                         │                          │
      ◄──────────────────────────┤                         │                          │
```

---

## 4. Subsystem Configuration

The extension automatically discovers project configuration from the local workspace:

| Setting | Discovery Source | Usage |
|---|---|---|
| `rootPath` | `process.cwd()` / VS Code workspace root | Base folder for workspace discovery and `.jules` tasks. |
| `packageManager` | `package-lock.json` existence | Set to `npm` or `unknown`. |
| `gatewayUrl` | Default `http://localhost:3000` | Gateway endpoint for REST and WebSocket connections. |

---

## 5. Known Issues & Edge Cases

1. **Non-Git Workspace Directory**: If opened in a directory without `.git`, `GitAdapter` defaults branch to `main` with fallback zero commit hashes.
2. **Multiple VS Code Windows**: Simultaneous VS Code instances writing to `.jules/` file directory can cause file access collisions; managed by using task UUID filenames.

---

## 6. Related Notes
- [[Features/API & WebSocket Server]] — REST API and WebSocket gateway specifications.
- [[Features/Git & GitHub Integration]] — Platform Git management and base validation.
- [[Features/Task & Queue Management]] — Backend task management and status models.
