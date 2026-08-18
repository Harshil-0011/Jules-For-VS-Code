# FINAL ARCHITECTURE
Jules Ecosystem
Version: 4.0 Status: Canonical Architecture Purpose: Final architecture for the Jules Extension, Jules Coding IDE, and Jules Code CLI

1. Executive Decision
This project consists of three independent products:

Jules Extension
- Integrates Jules into existing development environments.
- First implementation target: VS Code.
- Does not attempt to become a standalone IDE.

Jules Coding IDE
- A standalone AI-native coding environment.
- Comparable in product category to modern AI coding IDEs such as Antigravity/Cursor-class products.
- Jules is deeply integrated into the editor, workspace, terminal, Git, verification, and agent workflow.

Jules Code CLI
- A terminal-first autonomous coding agent.
- Product category: Claude Code / Codex CLI.
- Operates directly against repositories.
- Supports interactive, non-interactive, CI, automation, and headless workflows.
- It is not an operating system and must never be architected as one.

These are separate products.

They must be:
- independently installable
- independently runnable
- independently testable
- independently versioned
- independently deployable where appropriate

They may share carefully designed libraries, protocols, and services.
They must not depend on one another for normal operation.

2. Product Relationship
The architecture is:

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

The shared layer is deliberately small.
The products must not become three user interfaces over one giant application.

3. Core Principle
The platform follows this rule:

Jules is the primary intelligence. The products are independent clients. The deterministic infrastructure controls execution.

The LLM/agent decides:
- what it believes the problem is
- how to solve it
- what code to propose
- what investigation to perform

The platform decides:
- what the agent is allowed to do
- what tools it can use
- what repository it can access
- what files it can modify
- whether approval is required
- whether a task may continue
- whether verification succeeded
- whether a merge is permitted
- whether budgets are exceeded

4. No "Agent OS"
The previous "Agent OS" concept is removed.
The project is not an operating system.
There is no attempt to replace Windows, macOS, Linux, host shell, host kernel, or host filesystem.
The Jules Code CLI is a coding agent runtime and terminal interface.
The Jules IDE is a coding application.
The Jules Extension is an IDE integration.
This distinction is permanent.

5. Product 1 — Jules Extension
Objective: Bring Jules into an existing development environment (initial target: VS Code).

Responsibilities:
The extension owns host IDE integration, UI, commands, local workspace discovery, local status, authentication UX, Jules panel, task view, activity view, diff view, approval UI, and verification UI.
The extension does not own durable task state, orchestration truth, provider credentials, global agent scheduling, or authoritative Git state.

6. Extension Architecture
```text
VS CODE
   │
   ▼
Jules Extension
   │
   ├── Commands
   ├── Views
   ├── Workspace Adapter
   ├── Git Adapter
   ├── Authentication
   ├── Event Client
   └── Jules UI
   │
   ▼
Jules Platform / Jules API
```
The extension must remain lightweight. If the extension disappears, the task must continue to exist independently.

7. Product 2 — Jules Coding IDE
Objective: Build a standalone AI-native coding environment.
The IDE provides code editor, file explorer, search, terminal, Git, debugging, problems, output, workspace management, extensions/plugins, previews, Jules, agent teams, autonomous workflows, verification, task management, and project memory.

8. IDE Architecture
```text
JULES IDE
│
├── Application Shell
├── Workspace
├── Editor
├── Explorer
├── Search
├── Terminal
├── Git
├── Debugger
├── Problems
├── Preview
├── Jules
├── Agent Teams
├── Tasks
└── Verification
        │
        ▼
Shared Jules / Agent / Tool Protocols
```
The IDE must not embed the Jules CLI as its internal implementation. It may reuse the same libraries where technically appropriate.

9. IDE Product Principle
The IDE's differentiator is AI-native software engineering with Jules as a first-class development participant.
Primary loop: User Intent → Repository Understanding → Plan → Agent Execution → Live Changes → Verification → Review → Merge.

10. Product 3 — Jules Code CLI
Objective: Build a first-class terminal coding agent in the category of Claude Code / Codex CLI.
It is an autonomous coding agent operating directly against repositories.

11. CLI Primary UX
Typical usage: `jules`, `jules "fix the failing tests"`, `jules exec "implement authentication"`, `jules review`, `jules fix`, `jules run --non-interactive`.

12. CLI Modes
Interactive, Single task, Headless, CI, Review, Verification.

13. CLI Agent Loop
```text
                    USER
                      │
                      ▼
                  INTERPRET
                      │
                      ▼
                  INSPECT
                      │
                      ▼
                   PLAN
                      │
                      ▼
               POLICY CHECK
                      │
          ┌───────────┴───────────┐
          │                       │
       APPROVED               BLOCKED
          │                       │
          ▼                       ▼
       EXECUTE                 ASK USER
          │
          ▼
        OBSERVE
          │
          ▼
       VERIFY
          │
      ┌───┴────┐
      │        │
    FAIL      PASS
      │        │
      ▼        ▼
   DIAGNOSE  COMPLETE
      │
      ▼
    REPAIR
      │
      └──────────→ VERIFY
```
Every loop is bounded.

14. CLI Tool Architecture
Exposes tools: `read_file`, `write_file`, `edit_file`, `search`, `list_files`, `git_status`, `git_diff`, `git_log`, `git_branch`, `git_checkout`, `run_command`, `run_tests`, `run_build`, `run_lint`, `run_typecheck`, `github`.
Tool execution must go through policy.

15. CLI Permission Modes
Modes: `READ_ONLY`, `ASK`, `AUTO`, `CI`.

16. CLI Repository Awareness
Before modifying a repository, Jules Code inspects directory, Git status, branch, HEAD, staged/unstaged/untracked files, project type, package manager, build/test system, and project instructions.
Existing user changes must be protected.

17. CLI Session Model
Resumable sessions via `jules session list` and `jules session resume <id>`.

18. Shared Architecture
Shared components:
```text
shared/
├── jules-sdk/
├── agent-protocol/
├── task-protocol/
├── git-engine/
├── github-client/
├── verification-engine/
├── security-policy/
├── sandbox/
├── context-engine/
├── artifact-model/
└── common-types/
```

19. Jules Integration
Isolated behind `JulesProvider` and `JulesAdapter`. No direct REST calls to Jules endpoints outside the adapter.

20. Jules Session Mapping
`Internal Task → Jules Execution → Jules Session (Activities, State, Outputs)`.

21. Provider Boundary
`AgentProvider → JulesAdapter / FutureProvider / Local/Custom`.

22. Platform Core
Authentication, Tenancy, Tasks, Attempts, Executions, Workflows, DAG, Scheduler, Agent Registry, Provider Registry, Context, Memory, Tools, Policies, Budgets, Git, GitHub, Verification, Evidence, Artifacts, Approvals, Audit, Observability.

23. Task Model
Durable Task structure with Attempts, Executions, Artifacts, Dependencies, Evidence, Decisions, and Verification.

24. Workflow Model
DAG (dependency structure) and Workflow (execution semantics).

25. Multi-Agent Architecture
Lead Jules coordinates Backend Jules, Frontend Agent, Security Agent, Integrator, Verification.

26. Agent Isolation
Each write-capable agent receives isolated repository state. Base commit mismatch results in STALE RESULT and reconciliation.

27. Git Architecture
Database = orchestration truth; Git = source truth; GitHub = remote collaboration truth; Jules = provider execution truth; Verification = verification truth.

28. Merge Coordinator
Pipeline: Agent Result → Base Validation → Patch Validation → Conflict Detection → Apply → Build → Tests → Security → Review → Policy → Approval → Merge.

29. Verification
Independent verification execution for build, tests, lint, typecheck, static analysis, dependency/secret scanning, and integration tests.

30. Evidence
Claim → Evidence → Verification → Decision.

31. Security Boundary
Repository content is untrusted data. System policy cannot be overridden by untrusted content.

32. Tool Security
Agent → Tool Request → Policy → Permission → Sandbox → Execution → Result.

33. Sandbox
Isolated CPU, RAM, disk, process count, runtime, filesystem, and network controls.

34. Network Policy
Default DENY with explicit domain allowlist.

35. Secrets
Scoped credentials with automatic redaction from logs, events, traces, artifacts, and context.

36. Risk Engine
Classifies operations into LOW, MEDIUM, HIGH, CRITICAL.

37. Policy Engine
Deterministic ALLOW / DENY / APPROVAL_REQUIRED evaluation.

38. Budget Engine
Budgets at global, user, project, task, team, and agent levels.

39. Event Architecture
Command → Handler → Transaction → State Change → Outbox Event → Event Bus → Consumers.

40. Reliability
Transactional outbox, inbox/idempotent consumers, leases, heartbeats, fencing tokens, retries, backoff, circuit breakers, dead-letter handling.

41. Scheduler
Topological DAG scheduling with priority, fairness, concurrency, budgets, capability matching, and backpressure.

42. Failure Recovery
Disposable workers resuming or retrying state after failure via fencing token validation.

43. Human Takeover
First-class workflow state preserving human edits.

44. Emergency Stop
Independent kill switch halting execution broker operations across all workers.

45. Persistence
PostgreSQL for durable state, Redis for ephemeral caching/queues, object storage for artifacts.

46. Observability
Structured JSON logging with trace_id, correlation_id, causation_id, task_id, attempt_id, execution_id, agent_id.

47. Three-Product Independence
Extension, IDE, and CLI are independently installable, runnable, and testable without requiring each other.

48. Cross-Product Interoperability
Communication via shared APIs, protocols, and contracts.

49. Shared Protocols
Versioned protocols for Agent, Task, Event, Artifact, Verification, Provider Capability, and Auth.

50. Repository Structure
Target workspace layout: `apps/` (`jules-extension`, `jules-ide`, `jules-cli`), `packages/` (shared libraries), `server/` (platform backend), `tests/`, `docs/`.

51. Architecture Dependency Rule
`Products → Protocols / SDKs → Core Services → Providers / Infrastructure`.

52-54. Products Are Not Backends
CLI, IDE, and Extension own their respective UX/client logic while platform owns global orchestration truth.

55. Local-First Capability
CLI is capable of local repository operations without requiring cloud connection.

56. Cloud/Remote Capability
Connected tasks continue independently of client UI connection.

57. State Ownership
Clear authority separation between Platform, Jules, Git, GitHub, Verification, and Product UIs.

58. Failure Modes
Comprehensive detection, mitigation, recovery, and residual risk tracking for all failures.

59. Testing Architecture
Unit, Integration, Contract, E2E, Concurrency, Security, and Chaos testing.

60. Critical Invariants
System invariants ensuring correctness, safety, and verifiable autonomous operation.

61. What "Perfectly Working" Means
Failures are detected, contained, recorded, recovered/escalated, and verified.

62. Implementation Order
Phase 0 through Phase 11 rollout plan.

63. Final Acceptance Criteria
Extension, IDE, and CLI independently pass end-to-end user workflows.

64. Rejected Architectures
One giant application, IDE as central backend, CLI as IDE controller, "Agent OS", separate Jules implementations, microservices everywhere.

65. Residual Risks
External outages and provider behavior bounded and recorded.

66. Final Product Definition
Jules Extension + Jules Coding IDE + Jules Code CLI sharing underlying protocols and safety infrastructure.
