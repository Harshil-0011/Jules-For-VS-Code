---
title: "Git & GitHub Integration"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "git"
  - "github"
  - "branches"
  - "pull-requests"
aliases:
  - "Git Integration"
  - "GitHub Provider"
  - "Git & GitHub Integration"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Features/Verification & Merge Engine]]"
  - "[[Features/Frontend UI]]"
confidence: "high"
---

# Git & GitHub Integration Feature Specification

## 1. System Overview

The **Git & GitHub Integration** subsystem manages repository workspace isolation, branch creation, HEAD base commit validation, and GitHub pull request dispatch (`server/git/git_manager.ts`, `server/github/github_provider.ts`).

Git serves as the source-history authority, GitHub serves as the remote collaboration authority, and the internal SQLite database serves as the orchestration authority.

---

## 2. Key Components

1. **`GitManager`** (`server/git/git_manager.ts`):
   - **`createTaskBranch(taskId, baseBranch)`**: Creates isolated Git task branches (`jules/task-${taskId}`).
   - **`validateBaseCommit(taskId)`**: Compares task expected base commit against current HEAD commit. Returns `valid: false` if target branch HEAD has diverged.
   - **`hasUncommittedChanges()`**: Inspects workspace status for dirty file state.
2. **`GitHubProvider`** (`server/github/github_provider.ts`):
   - **`createPullRequest(options)`**: Dispatches GitHub REST API requests to open pull requests with automated change descriptions and verification status summaries.
   - **`getPullRequestStatus(prNumber)`**: Polls remote PR review comments and CI check runs.

---

## 3. Git Branch Isolation & Base Validation Flow Diagram

```text
MERGE COORDINATOR            GIT MANAGER             GITHUB PROVIDER             GITHUB API
        │                         │                        │                          │
        │ validateBaseCommit(id)  │                        │                          │
        ├────────────────────────►│                        │                          │
        │                         │ Read .git/HEAD         │                          │
        │                         ├──────────────┐         │                          │
        │                         │ Compare HEAD │         │                          │
        │                         │ vs expected  │         │                          │
        │                         ◄──────────────┘         │                          │
        │                         │                        │                          │
        │ {valid: true}           │                        │                          │
        ◄─────────────────────────┤                        │                          │
        │                         │                        │                          │
        │ createPullRequest(opts) │                        │                          │
        ├─────────────────────────────────────────────────►│                          │
        │                         │                        │ POST /repos/.../pulls    │
        │                         │                        ├─────────────────────────►│
        │                         │                        │                          │ PR Created #42
        │                         │                        ◄──────────────────────────┤
        │ {prNumber: 42}          │                        │                          │
        ◄──────────────────────────────────────────────────┤                          │
```

---

## 4. Subsystem Configuration

Managed via Zod configuration schema (`server/api/config.ts`):

| Config Field | Environment Variable | Default Value | Description |
|---|---|---|---|
| `githubToken` | `GITHUB_TOKEN` | `mock-github-token` | Personal Access Token or App Token for GitHub API access. |

---

## 5. Known Issues & Edge Cases

1. **Stale Base Commit (`STALE_BASE_COMMIT`)**: If main branch commits occur during agent execution, `validateBaseCommit()` flags a stale base commit error. The branch must be rebased onto HEAD before merge evaluation can proceed.
2. **Uncommitted Staged Files**: Agents attempting to switch branches while untracked user files exist are blocked to prevent overwriting user work.

---

## 6. Related Notes
- [[Features/Verification & Merge Engine]] — Merge Coordinator and build verification gate.
- [[Features/Frontend UI]] — VS Code Extension Git adapter integration.
- [[Features/Configuration]] — GitHub token configuration settings.
