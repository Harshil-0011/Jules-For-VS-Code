# Security Model

## 1. Security Philosophy
The platform operates on a **Zero Trust for Untrusted Content** architecture. Repository code, issue descriptions, PR comments, and web sources are treated as untrusted data capable of prompt injection or malicious behavior.

## 2. Trust Hierarchy
1. **SYSTEM POLICY**: Immutable security boundaries configured by system admins.
2. **USER INTENT**: Expressed commands from authenticated human users.
3. **ORCHESTRATOR POLICY**: Control plane limits, budgets, and risk rules.
4. **AGENT ROLE**: Declared capabilities and scope of assigned agent.
5. **REPOSITORY DATA**: Source code, instructions, local config files.
6. **EXTERNAL CONTENT**: Web pages, third-party packages, remote issue comments.

Repository content CANNOT override System Policy, User Intent, or Orchestrator Policy.

## 3. Sandboxing & Isolation
- All tool calls (filesystem, shell, git, npm, test runners) pass through the Execution Broker.
- Execution occurs within isolated sandboxes with strict CPU, memory, filesystem, and network controls.
- Default Network Policy: `DENY_ALL`. Outbound connections require explicit domain allowlists.

## 4. Secrets Management
- Master credentials are never passed to agents or stored in task context.
- Agents receive scoped, short-lived tokens.
- Automatic secret redaction scanner runs on all outputs, logs, events, and artifacts before persistence.

## 5. Emergency Stop
- Global switch instantly pauses all active schedulers, cancels pending tool executions, blocks merges, and halts worker pools.
