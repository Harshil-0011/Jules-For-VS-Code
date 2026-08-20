---
title: "LLM & Agent Integration"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "jules"
  - "llm"
  - "agent"
  - "orchestration"
aliases:
  - "LLM Integration"
  - "Jules Adapter"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Features/Context Engine]]"
  - "[[Features/Security]]"
confidence: "high"
---

# LLM & Agent Integration Feature Specification

## 1. System Overview

The **LLM & Agent Integration** subsystem isolates all interactions with Google Jules and AI model providers behind strict interface boundaries (`JulesAdapter`, `AgentProvider`, `TeamOrchestrator`).

By treating **Google Jules** as the primary coding intelligence, the system maps internal task state to Jules sessions and orchestrates sub-agents without leaking model-specific API details into product client logic.

---

## 2. Key Components

1. **`JulesAdapter`** (`server/jules/jules_adapter.ts`):
   - Integrates directly with Google Jules API `v1alpha` endpoint (`https://jules.googleapis.com/v1alpha`).
   - Manages session creation, message dispatch, activity polling, plan approvals, and session state mapping.
2. **`AgentProvider` & `AgentRegistry`** (`server/providers/agent_provider.ts`):
   - Defines a provider-agnostic interface (`AgentProvider`) with capability discovery (`planning`, `code_generation`, `tool_execution`, `streaming`, `review`).
   - Registers available agent providers for task assignment.
3. **`TeamOrchestrator`** (`server/teams/team.ts`):
   - Orchestrates multi-agent sub-teams, assigning specialized sub-agents (`Backend Agent`, `Frontend Agent`, `Security Agent`) to sub-tasks.

---

## 3. Interaction Sequence Flow Diagram

```text
TASK RUNNER            TEAM ORCHESTRATOR           JULES ADAPTER           GOOGLE JULES API
    │                          │                         │                        │
    │ assignTask(task)         │                         │                        │
    ├─────────────────────────►│                         │                        │
    │                          │ createSession(req)      │                        │
    │                          ├────────────────────────►│                        │
    │                          │                         │ POST /v1alpha/sessions │
    │                          │                         ├───────────────────────►│
    │                          │                         │                        │
    │                          │                         │ Session Created        │
    │                          │                         ◄────────────────────────┤
    │                          │                         │                        │
    │                          │ sendMessage(sessionId)  │                        │
    │                          ├────────────────────────►│                        │
    │                          │                         │ POST /activities       │
    │                          │                         ├───────────────────────►│
    │                          │                         │                        │
    │                          │ getActivities()         │                        │
    │                          ├────────────────────────►│                        │
    │                          │                         │ GET /activities        │
    │                          │                         ├───────────────────────►│
    │                          │                         │ Activities Array       │
    │                          │                         ◄────────────────────────┤
    │                          │ approvePlan(sessionId)  │                        │
    │                          ├────────────────────────►│                        │
    │                          │                         │ POST /approvePlan      │
    │                          │                         ├───────────────────────►│
    │                          │ Result                  │                        │
    ◄──────────────────────────┴─────────────────────────┴────────────────────────┤
```

---

## 4. Subsystem Configuration

Managed via Zod configuration schema (`server/api/config.ts`):

| Config Field | Environment Variable | Default Value | Purpose |
|---|---|---|---|
| `julesApiKey` | `JULES_API_KEY` | `mock-jules-key` | API key for authenticating requests with Google Jules API. |
| `julesApiUrl` | `JULES_API_URL` | `https://jules.googleapis.com/v1alpha` | Base endpoint URL for Google Jules `v1alpha` service. |

---

## 5. Known Issues & Edge Cases

1. **Session State Desynchronization**: If a network error occurs during session creation, local task attempts can become orphaned. Handled by reconciling active sessions upon worker restart.
2. **Provider Rate Limits**: Transient 429 rate limit responses from Jules API open the adapter circuit breaker and transition tasks to `BLOCKED` status until retry intervals elapse.

---

## 6. Related Notes
- [[Features/Context Engine]] — Context memory prompt augmentation for Jules sessions.
- [[Features/Security]] — Zero Trust policy checking for agent tool requests.
- [[Features/Task & Queue Management]] — Task lifecycle management and queue allocation.
