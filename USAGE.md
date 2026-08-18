# Jules Ecosystem - Usage Guide

This guide provides instructions for using the Jules Ecosystem products: **Jules Extension**, **Jules Coding IDE**, and **Jules Code CLI**.

---

## 1. Jules Code CLI

The `jules` CLI is a terminal-first autonomous coding agent.

### Usage
```bash
# Interactive mode
jules

# Task execution
jules "fix the failing tests"

# Exec command
jules exec "implement authentication"

# Code review
jules review

# Auto-fix
jules fix

# Headless / CI
jules exec --task "Fix all failing tests" --non-interactive
```

### Permission Modes
- `READ_ONLY`: No file or workspace mutations allowed.
- `ASK`: High-risk or mutating tool execution requires user confirmation.
- `AUTO`: Permitted operations execute automatically within policy bounds.
- `CI`: Non-interactive execution for automated build and repair pipelines.

---

## 2. Jules Extension

Installed into VS Code to bring Jules into an existing IDE workspace.
Provides Jules sidebar panel, activity feed, diff reviewer, approval prompts, and emergency stop.

---

## 3. Jules Coding IDE

A standalone AI-native IDE integrating code editor, explorer, terminal, Git workspace, problems view, and Jules agent team workflows.

---

## 4. Environment Configuration

| Variable | Description | Default |
|---|---|---|
| `PORT` | Control plane gateway port | `3000` |
| `DB_PATH` | Database file path | `./jules_platform.db` |
| `JULES_API_KEY` | Google Jules API key | `mock-jules-key` |
| `JULES_API_URL` | Google Jules API URL | `https://jules.googleapis.com/v1alpha` |
| `GITHUB_TOKEN` | GitHub API access token | `mock-github-token` |
| `EMERGENCY_STOP` | Global emergency stop flag | `false` |
