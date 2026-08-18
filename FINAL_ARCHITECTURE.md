FINAL ARCHITECTURE
Jules Ecosystem
Version: 4.0 Status: Canonical Architecture Purpose: Final architecture for the Jules Extension, Jules Coding IDE, and Jules Code CLI

1. Executive Decision
This project consists of three independent products:

Jules Extension

Integrates Jules into existing development environments.
First implementation target: VS Code.
Does not attempt to become a standalone IDE.
Jules Coding IDE

A standalone AI-native coding environment.
Comparable in product category to modern AI coding IDEs such as Antigravity/Cursor-class products.
Jules is deeply integrated into the editor, workspace, terminal, Git, verification, and agent workflow.
Jules Code CLI

A terminal-first autonomous coding agent.
Product category: Claude Code / Codex CLI.
Operates directly against repositories.
Supports interactive, non-interactive, CI, automation, and headless workflows.
It is not an operating system and must never be architected as one.
These are separate products.

They must be:

independently installable
independently runnable
independently testable
independently versioned
independently deployable where appropriate
They may share carefully designed libraries, protocols, and services.

They must not depend on one another for normal operation.

2. Product Relationship
The architecture is:

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
The shared layer is deliberately small.

The products must not become three user interfaces over one giant application.

3. Core Principle
The platform follows this rule:

Jules is the primary intelligence. The products are independent clients. The deterministic infrastructure controls execution.

The LLM/agent decides:

what it believes the problem is
how to solve it
what code to propose
what investigation to perform
The platform decides:

what the agent is allowed to do
what tools it can use
what repository it can access
what files it can modify
whether approval is required
whether a task may continue
whether verification succeeded
whether a merge is permitted
whether budgets are exceeded
4. No "Agent OS"
The previous "Agent OS" concept is removed.

The project is not an operating system.

There is no attempt to replace:

Windows
macOS
Linux
the host shell
the host kernel
the host filesystem
The Jules Code CLI is a coding agent runtime and terminal interface.

The Jules IDE is a coding application.

The Jules Extension is an IDE integration.

This distinction is permanent.

5. Product 1 — Jules Extension
Objective
Bring Jules into an existing development environment.

Initial target:

VS Code

Future targets may include other IDEs.

Responsibilities
The extension owns:

host IDE integration
UI
commands
local workspace discovery
local status
authentication UX
Jules panel
task view
activity view
diff view
approval UI
verification UI
The extension does not own:

durable task state
orchestration truth
provider credentials
global agent scheduling
authoritative Git state
6. Extension Architecture
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
The extension must remain lightweight.

If the extension disappears, the task must continue to exist independently.

7. Product 2 — Jules Coding IDE
Objective
Build a standalone AI-native coding environment.

The IDE must eventually provide:

code editor
file explorer
search
terminal
Git
debugging
problems
output
workspace management
extensions/plugins where appropriate
previews
Jules
agent teams
autonomous workflows
verification
task management
project memory
8. IDE Architecture
The IDE is an independent application.

JULES IDE
│
├── Application Shell
│
├── Workspace
│
├── Editor
│
├── Explorer
│
├── Search
│
├── Terminal
│
├── Git
│
├── Debugger
│
├── Problems
│
├── Preview
│
├── Jules
│
├── Agent Teams
│
├── Tasks
│
└── Verification
        │
        ▼
Shared Jules / Agent / Tool Protocols
The IDE must not embed the Jules CLI as its internal implementation.

It may reuse the same libraries where technically appropriate.

9. IDE Product Principle
The IDE should not initially attempt to clone every feature of an established IDE.

Its differentiator is:

AI-native software engineering with Jules as a first-class development participant.

The primary loop is:

User Intent
    ↓
Repository Understanding
    ↓
Plan
    ↓
Agent Execution
    ↓
Live Changes
    ↓
Verification
    ↓
Review
    ↓
Merge
10. Product 3 — Jules Code CLI
Objective
Build a first-class terminal coding agent in the category of:

Claude Code
Codex CLI
It is not a management CLI.

It is not an IDE controller.

It is not an "Agent OS shell".

It is an autonomous coding agent.

11. CLI Primary UX
Typical usage:

jules
or:

jules "fix the failing tests"
or:

jules exec "implement authentication"
or:

jules review
or:

jules fix
or:

jules run --non-interactive
12. CLI Modes
Interactive
jules
Provides:

conversation
repository investigation
planning
tool execution
code editing
verification
iterative repair
Single task
jules "fix the authentication bug"
Headless
jules exec \
  --task "Fix all failing tests" \
  --non-interactive
CI
jules ci \
  --task "Repair the failing build"
Review
jules review
Verification
jules verify
13. CLI Agent Loop
The CLI is built around a controlled agent loop:

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
Every loop is bounded.

14. CLI Tool Architecture
The CLI exposes tools such as:

read_file
write_file
edit_file
search
list_files
git_status
git_diff
git_log
git_branch
git_checkout
run_command
run_tests
run_build
run_lint
run_typecheck
github
Tool execution must go through policy.

The agent never receives unrestricted execution simply because it requested a shell command.

15. CLI Permission Modes
Support at minimum:

READ_ONLY
ASK
AUTO
CI
The exact CLI syntax may evolve.

The semantics must remain:

READ_ONLY
No mutations.

ASK
Mutating or high-risk actions require approval.

AUTO
Permitted actions execute automatically within policy.

CI
Non-interactive execution with explicitly configured permissions.

16. CLI Repository Awareness
Before modifying a repository, Jules Code must inspect:

current directory
Git status
current branch
HEAD
staged changes
unstaged changes
untracked files
project type
package manager
build system
test system
dependency configuration
project instructions
relevant source files
The agent must protect existing user changes.

Example:

User changes detected.

Jules must not silently overwrite them.
17. CLI Session Model
CLI sessions must be resumable.

jules session list
jules session resume <id>
Sessions record:

task
repository
branch
context
agent
provider
tool activity
artifacts
verification
decisions
18. Shared Architecture
The three products share protocols and libraries, not application ownership.

Shared components:

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
Shared code must remain:

deterministic
testable
provider-independent where possible
UI-independent
product-independent
19. Jules Integration
Jules integration is isolated behind:

JulesProvider
JulesAdapter
The rest of the system must never call Jules REST endpoints directly.

The current Jules API is v1alpha and documents sessions, source contexts, GitHub repository starting branches, plan approval, messaging, activities, session states, and pull-request outputs.

Therefore the adapter must treat Jules capabilities as versioned and discoverable.

Do not invent undocumented operations.

20. Jules Session Mapping
Current Jules concepts map approximately to internal concepts:

Internal Task
    │
    └── Jules Execution
            │
            └── Jules Session
                    │
                    ├── Activities
                    ├── State
                    └── Outputs
A Jules session is not equivalent to an internal task.

A task may contain multiple attempts/executions.

21. Provider Boundary
                  AgentProvider
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
       Jules        Future        Local/
       Adapter      Provider      Custom
The platform must not assume every provider supports the same capabilities.

Capability discovery is mandatory.

Example:

planning
code_generation
repository_access
tool_execution
streaming
review
parallel_agents
22. Platform Core
The shared backend/platform architecture contains:

Authentication
Tenancy
Tasks
Attempts
Executions
Workflows
DAG
Scheduler
Agent Registry
Provider Registry
Context
Memory
Tools
Policies
Budgets
Git
GitHub
Verification
Evidence
Artifacts
Approvals
Audit
Observability
23. Task Model
Tasks are durable.

Task
 ├── Attempts
 │     ├── Executions
 │     └── Artifacts
 │
 ├── Dependencies
 ├── Evidence
 ├── Decisions
 └── Verification
Never overwrite previous attempts.

24. Workflow Model
DAG:

dependency structure

Workflow:

execution semantics

Example:

Analyze
   ↓
Plan
   ↓
Approve
   ↓
Implement
   ↓
Test
   ↓
Review
   ↓
Merge
Failures have explicit transitions.

25. Multi-Agent Architecture
Multiple agents may collaborate.

                 Lead Jules
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     Backend       Frontend     Security
      Jules         Agent        Agent
        │            │            │
        └────────────┼────────────┘
                     ▼
                  Integrator
                     │
                     ▼
                Verification
Agents do not directly trust each other's claims.

The platform coordinates them.

26. Agent Isolation
Each write-capable agent receives isolated repository state.

Record:

repository
branch
base_commit
workspace
agent
task
attempt
Before applying output:

expected base commit
        ==
current base commit
If false:

STALE RESULT
Stop and reconcile.

27. Git Architecture
Git is the source-history authority.

GitHub is the remote collaboration authority.

Internal database is the workflow authority.

Do not confuse them.

Database
  = orchestration truth

Git
  = source truth

GitHub
  = remote collaboration truth

Jules
  = provider execution truth

Verification
  = verification truth
28. Merge Coordinator
Agents never directly decide to merge.

Pipeline:

Agent Result
     ↓
Base Validation
     ↓
Patch Validation
     ↓
Conflict Detection
     ↓
Apply
     ↓
Build
     ↓
Tests
     ↓
Security
     ↓
Review
     ↓
Policy
     ↓
Approval
     ↓
Merge
29. Verification
"Jules says it works" is not verification.

Verification executes independently.

Required capabilities:

build
tests
lint
typecheck
static analysis
dependency scanning
secret scanning
security checks
integration tests
Verification requirements depend on risk.

30. Evidence
Every important claim can be represented as:

Claim
 ↓
Evidence
 ↓
Verification
 ↓
Decision
Evidence must have provenance.

Possible states:

UNVERIFIED
WEAK
SUPPORTED
STRONGLY_SUPPORTED
VERIFIED
DISPUTED
REJECTED
31. Security Boundary
Repository content is untrusted.

This includes:

source files
README instructions
issues
PR comments
generated files
downloaded content
dependencies
Untrusted content cannot override system policy.

32. Tool Security
All dangerous tools pass through:

Agent
 ↓
Tool Request
 ↓
Policy
 ↓
Permission
 ↓
Sandbox
 ↓
Execution
 ↓
Result
33. Sandbox
Code execution must be isolated.

Control:

CPU
RAM
disk
process count
runtime
filesystem
network
The control plane must never execute arbitrary agent commands directly.

34. Network Policy
Default:

DENY
Then explicitly allow:

package registries
GitHub
required APIs
approved domains
Network activity should be observable.

35. Secrets
Secrets must never be embedded into prompts unnecessarily.

Agents must not receive:

master database credentials
unrestricted GitHub tokens
unrestricted Jules credentials
unrelated project secrets
Use scoped credentials.

Redact secrets from:

logs
events
traces
artifacts
agent context
36. Risk Engine
Classify operations:

LOW
MEDIUM
HIGH
CRITICAL
High-risk operations include:

authentication changes
authorization changes
secret handling
infrastructure
deployment
database migration
dependency changes
security boundary changes
Risk determines verification and approval requirements.

37. Policy Engine
The policy engine is deterministic.

Example:

Operation
    ↓
Identity
    ↓
Agent
    ↓
Resource
    ↓
Risk
    ↓
Policy
    ↓
ALLOW / DENY / APPROVAL_REQUIRED
Every policy decision is logged.

38. Budget Engine
Budgets constrain:

runtime
retries
agents
parallelism
provider requests
tool calls
cost
workflow depth
repair cycles
Budgets exist at:

global
user
project
task
team
agent
39. Event Architecture
Use:

Command
 ↓
Handler
 ↓
Transaction
 ↓
State Change
 ↓
Outbox Event
 ↓
Event Bus
 ↓
Consumers
Never use an event as an implicit command.

40. Reliability
Implement:

transactional outbox
inbox/idempotent consumers
idempotency keys
leases
heartbeats
fencing tokens
retries
backoff
circuit breakers
dead-letter handling
41. Scheduler
Scheduler responsibilities:

dependency satisfaction
priority
fairness
concurrency
budgets
capability matching
provider health
retries
backpressure
No project may starve all others.

42. Failure Recovery
Workers are disposable.

After a crash:

Load durable state
      ↓
Check lease
      ↓
Check fencing token
      ↓
Reconcile provider
      ↓
Reconcile Git
      ↓
Determine last valid state
      ↓
Resume / Retry / Abort
43. Human Takeover
Human takeover is a first-class workflow state.

Agent Running
      ↓
Human Takeover
      ↓
Agent Paused
      ↓
Human Changes
      ↓
Repository Reconciliation
      ↓
Resume / Complete
Never silently discard human edits.

44. Emergency Stop
Emergency stop must be independent of Jules.

It must prevent:

new work
new tool execution
merges
deployments
It must continue working even when Jules is unavailable.

45. Persistence
Production:

PostgreSQL
for durable state.

Optional:

Redis
for ephemeral coordination/cache/queue workloads.

Object storage for large immutable artifacts.

Redis must never become the only durable workflow authority.

46. Observability
Every operation should support:

trace_id
correlation_id
causation_id
task_id
attempt_id
execution_id
agent_id
provider_session_id
repository_id
Measure:

task duration
queue depth
provider latency
provider failures
retries
verification failures
merge conflicts
sandbox failures
resource use
47. Three-Product Independence
The following must be possible:

Extension installed
without IDE
without CLI
IDE installed
without Extension
without CLI
CLI installed
without IDE
without Extension
This is a hard architectural requirement.

48. Cross-Product Interoperability
Although independent, products can share state through APIs/protocols.

Example:

CLI creates task
      ↓
Task stored
      ↓
IDE sees task
      ↓
Extension sees task
But no product directly reads another product's internal state.

All communication occurs through documented contracts.

49. Shared Protocols
Create versioned protocols:

Agent Protocol
Task Protocol
Event Protocol
Artifact Protocol
Verification Protocol
Provider Capability Protocol
Authentication Protocol
Products depend on protocols, not implementation details.

50. Repository Structure
Recommended target:

/
├── apps/
│   ├── jules-extension/
│   ├── jules-ide/
│   └── jules-cli/
│
├── packages/
│   ├── jules-sdk/
│   ├── agent-protocol/
│   ├── task-protocol/
│   ├── event-protocol/
│   ├── git-engine/
│   ├── github-client/
│   ├── verification-engine/
│   ├── security/
│   ├── sandbox/
│   ├── context-engine/
│   ├── artifact-model/
│   └── common/
│
├── server/
│   ├── api/
│   ├── auth/
│   ├── tasks/
│   ├── workflows/
│   ├── scheduler/
│   ├── agents/
│   ├── providers/
│   ├── policies/
│   ├── budgets/
│   ├── memory/
│   ├── verification/
│   ├── evidence/
│   ├── merge/
│   ├── audit/
│   └── observability/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   ├── e2e/
│   ├── concurrency/
│   ├── security/
│   ├── chaos/
│   └── recovery/
│
└── docs/
51. Architecture Dependency Rule
Dependency direction:

Products
   ↓
Protocols / SDKs
   ↓
Core Services
   ↓
Providers / Infrastructure
Never:

Jules API
   ↓
IDE
   ↓
CLI
or:

CLI
   ↓
IDE internals
or:

Extension
   ↓
CLI internals
52. CLI Must Not Become the Backend
The CLI may contain a local agent runtime.

It must not become the authoritative global platform database.

For local-only operation:

CLI
 ↓
Local Runtime
 ↓
Local Repository
For connected operation:

CLI
 ↓
Platform API
 ↓
Control Plane
The CLI must support both models where practical.

53. IDE Must Not Become the Backend
The IDE owns:

UI
workspace interaction
editor state
local UX
The platform owns:

durable tasks
agent orchestration
provider state
verification
policy
This prevents the IDE from becoming a monolithic application backend.

54. Extension Must Not Become the Backend
Same principle.

The extension is a host integration.

It must survive platform restarts and reconnect.

55. Local-First Capability
The CLI should be capable of meaningful operation without requiring a hosted Jules platform for every local action.

Local operations can include:

repository inspection
Git
file editing
local verification
tool policy
local session state
Provider-backed operations can use Jules.

This improves reliability and developer experience.

56. Cloud/Remote Capability
When connected to the platform:

tasks can continue remotely
Jules sessions can continue independently
IDE can reconnect
CLI can reconnect
extension can reconnect
The UI is not the task.

The task exists independently.

57. State Ownership
State	Authority
Task	Platform
Workflow	Platform
Agent assignment	Platform
Budget	Platform
Policy	Platform
Jules session	Jules
Jules activities	Jules
Git history	Git
Remote repository	GitHub
Verification result	Verification engine
Artifact metadata	Platform
User interface state	Product
Editor buffer	Product/workspace
58. Failure Modes
The architecture must explicitly handle:

Jules unavailable
GitHub unavailable
database unavailable
network failure
CLI crash
IDE crash
extension crash
provider timeout
duplicate event
duplicate command
stale worker
stale patch
merge conflict
semantic conflict
malicious repository
malicious dependency
secret leakage
sandbox escape attempt
policy failure
verification failure
user edits during agent execution
Every failure must have:

Detection
Mitigation
Recovery
Residual Risk
59. Testing Architecture
Testing is part of the architecture.

Unit
Test domain logic.

Integration
Test modules together.

Contract
Test:

Jules adapter
GitHub adapter
product protocols
End-to-End
Test:

CLI → Jules → Repository → Verification
IDE → Jules → Repository → Verification
Extension → Jules → Repository → Verification
Concurrency
Test:

simultaneous agents
duplicate commands
duplicate events
worker crashes
leases
fencing
simultaneous merges
Security
Test:

prompt injection
secret leakage
permission bypass
network escape
sandbox escape
cross-project access
Chaos
Test:

provider outage
database outage
network outage
process termination
corrupted state
interrupted merge
60. Critical Invariants
The system must guarantee as far as technically possible:

No unauthorized tool execution.
No stale worker can mutate current state.
No task runs before dependencies are satisfied.
No stale patch silently overwrites current work.
No product becomes dependent on another product.
No provider-specific API leaks into product code.
No secret is intentionally exposed to untrusted execution.
No repository instruction can override security policy.
No successful task is declared solely from an agent claim.
No durable workflow state exists only in memory.
Every important action is auditable.
Every important artifact has provenance.
Every autonomous loop is bounded.
Emergency stop can prevent new work.
Human edits are preserved.
Provider failure cannot corrupt internal workflow state.
61. What "Perfectly Working" Means
No distributed autonomous system can honestly guarantee zero failures.

The goal is therefore not:

"Nothing ever breaks."

The goal is:

When something breaks, it cannot silently corrupt state, bypass security, lose user work, or falsely report success.

A production-ready implementation must therefore prove:

Failure
 ↓
Detected
 ↓
Contained
 ↓
Recorded
 ↓
Recovered / Escalated
 ↓
Verified
62. Implementation Order
Implementation must occur in this order.

Phase 0 — Repository Audit
inspect every relevant file
identify obsolete architecture
identify duplicate implementations
identify unused dependencies
identify dead code
identify security problems
identify contradictions
Testing:

repository build
existing tests
dependency validation
Phase 1 — Shared Foundations
Build:

common types
provider interfaces
task protocol
event protocol
artifact protocol
Jules SDK boundary
Git engine
verification primitives
Testing:

unit tests
contract tests
type checking
build
Phase 2 — Jules Integration
Implement only documented Jules capabilities.

Test:

session creation
session retrieval
activity retrieval
plan approval
messaging
state mapping
provider failure handling
The Jules API currently documents these session/activity operations, so they form the stable integration boundary while unsupported functionality remains abstracted rather than fabricated.

Phase 3 — Core Agent Runtime
Implement:

context
tools
permissions
agent loop
sessions
verification
recovery
Testing:

tool tests
permission tests
agent-loop tests
failure tests
Phase 4 — Jules Code CLI
Build the real coding CLI.

Must support:

interactive mode
task mode
file inspection
editing
commands
Git
tests
verification
session resume
approvals
non-interactive mode
Testing:

CLI unit
CLI integration
repository E2E
interruption/recovery
permission tests
Phase 5 — Jules Extension
Build:

VS Code integration
Jules panel
tasks
activities
plans
approvals
changes
verification
Testing:

extension integration
reconnect
restart
task continuation
Phase 6 — Jules IDE Foundation
Build:

desktop shell
workspace
editor
explorer
terminal
Git
search
problems
output
Testing:

workspace E2E
file integrity
Git integrity
restart recovery
Phase 7 — AI-Native IDE
Build:

Jules panel
contextual coding
task workflows
agent teams
verification
autonomous repair
project memory
Testing:

full coding workflow
multi-agent workflow
recovery
performance
Phase 8 — Multi-Agent System
Build:

agent registry
capabilities
multiple Jules sessions
specialized agents
task DAG
scheduler
budgets
isolation
Testing:

concurrency
starvation
race conditions
crash recovery
fencing
Phase 9 — Security
Build:

sandbox
network policy
secrets
risk engine
policy engine
audit
Testing:

adversarial tests
permission bypass tests
sandbox tests
secret leakage tests
prompt injection tests
Phase 10 — Cross-Product Interoperability
Verify that:

CLI
IDE
Extension
can independently operate while sharing compatible task/protocol state.

Testing:

CLI → IDE
IDE → CLI
Extension → CLI
CLI → Extension
reconnect
restart
concurrent access
No product may become a required dependency.

Phase 11 — Production Hardening
Implement:

observability
rate limiting
backups
migrations
disaster recovery
retention
performance
chaos testing
63. Final Acceptance
The project is complete only when all three products work independently.

Extension
A developer can install the extension into an existing IDE and use Jules for real coding tasks.

IDE
A developer can install the Jules IDE and perform an end-to-end software development workflow without requiring the extension or CLI.

CLI
A developer can:

open terminal
↓
start Jules Code
↓
give it a coding task
↓
let it inspect the repository
↓
let it plan
↓
let it modify code
↓
run tests
↓
repair failures
↓
review changes
↓
commit / PR
without needing the IDE or extension.

64. Rejected Architectures
One giant Jules application
Rejected.

It makes the three products coupled.

IDE as the central backend
Rejected.

The IDE must remain a product.

CLI as an IDE controller
Rejected.

The CLI is a standalone coding agent.

"Agent OS"
Rejected.

The project is not an operating system.

Separate Jules implementations
Rejected.

Provider integration must be shared through the Jules SDK/adapter boundary.

Microservices everywhere
Rejected for initial implementation.

Use modular boundaries first.

Extract services only when operational requirements justify them.

65. Residual Risks
The architecture cannot eliminate:

external Jules outages
Jules API evolution
LLM mistakes
malicious repositories
unknown vulnerabilities
unexpected provider behavior
host OS vulnerabilities
network failures
hardware failures
These risks must be:

bounded
observable
recoverable
documented
Never hide them behind claims of perfect autonomy.

66. Final Product Definition
The project is officially defined as:

Jules Extension
Bring Jules into your existing coding environment.

Jules Coding IDE
A standalone AI-native development environment built around Jules.

Jules Code CLI
A terminal-native autonomous coding agent in the Claude Code / Codex CLI category.

Together:

                     JULES
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
      EXTENSION       IDE          CLI
          │            │            │
          │            │            │
     Existing IDE   New IDE     Terminal
          │            │            │
          └────────────┼────────────┘
                       │
              Shared protocols
              Shared SDKs
              Shared security
              Shared verification
              Shared Git tooling
                       │
                       ▼
                  JULES API
This is the canonical architecture.

The three products remain independent.

The shared foundation prevents duplicated engineering.

The control plane provides safety and reliability.

Jules provides the primary coding intelligence.

The CLI provides terminal-native autonomous development.

The IDE provides a complete AI-native development environment.

The extension brings Jules into existing environments.

That is the final product boundary.
