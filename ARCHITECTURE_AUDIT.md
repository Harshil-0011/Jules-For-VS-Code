# Architecture Audit

## 1. Executive Summary
This document provides an audit of the Jules Ecosystem architecture, confirming the product boundary separation between **Jules Extension**, **Jules Coding IDE**, and **Jules Code CLI**.

## 2. Product Boundaries
- **Jules Extension**: VS Code integration client.
- **Jules Coding IDE**: Standalone AI-native IDE client.
- **Jules Code CLI**: Terminal-first autonomous coding agent.
- **Shared Layer**: Protocol definitions, SDKs, Git engine, sandbox, verification engine, and policy engine.

## 3. Key Findings
- Product independence is maintained (no client depends on another client).
- "Agent OS" terminology and concepts have been removed.
- Deterministic control plane retains authority over permissions, budgets, and verification.
