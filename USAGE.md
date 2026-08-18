# Jules Ecosystem - Usage Guide

Guide for using the three independent products in the **Jules Ecosystem**: **Jules Code CLI**, **Jules Extension**, and **Jules Coding IDE**.

---

## 1. Jules Code CLI

The `jules` CLI is a terminal-first autonomous coding agent.

### Commands

```bash
# Interactive mode
jules

# Task mode
jules "fix the failing tests"

# Exec mode
jules exec "implement authentication"

# Code review
jules review

# Auto repair
jules fix

# Headless / CI execution
jules exec --task "Fix all failing tests" --non-interactive
```

### Permission Modes

- `READ_ONLY`: File and workspace modifications are forbidden.
- `ASK`: High-risk or mutating tool operations require user approval.
- `AUTO`: Permitted operations execute automatically within policy bounds.
- `CI`: Non-interactive execution for automated build and repair pipelines.

---

## 2. Jules Extension

Installed in VS Code to bring Jules into an existing IDE workspace.
Provides the Jules sidebar panel, activity stream, diff viewer, approval prompts, and emergency stop button.

---

## 3. Jules Coding IDE

A standalone AI-native IDE integrating code editor, file explorer, terminal, Git workspace, problems view, and Jules agent team workflows.

---

## 4. Platform Configuration

| Variable | Description | Default |
|---|---|---|
| `PORT` | Gateway API port | `3000` |
| `DB_PATH` | SQLite database file path | `./jules_platform.db` |
| `JULES_API_KEY` | Google Jules API Key | `mock-jules-key` |
| `JULES_API_URL` | Google Jules Endpoint | `https://jules.googleapis.com/v1alpha` |
| `GITHUB_TOKEN` | GitHub Token | `mock-github-token` |
| `EMERGENCY_STOP` | Global emergency stop flag | `false` |
