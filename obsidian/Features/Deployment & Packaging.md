---
title: "Deployment & Packaging"
type: "feature"
created: "2026-08-20"
updated: "2026-08-20"
tags:
  - "feature"
  - "deployment"
  - "packaging"
  - "build"
  - "typescript"
aliases:
  - "Deployment & Packaging"
  - "Packaging"
  - "Build Pipeline"
links:
  - "[[Home]]"
  - "[[Features/Index]]"
  - "[[Getting Started]]"
  - "[[Features/Configuration]]"
confidence: "high"
---

# Deployment & Packaging Feature Specification

## 1. System Overview

The **Deployment & Packaging** subsystem defines the build pipeline, TypeScript compilation parameters, npm package scripts, and distribution models for the platform (`package.json`, `tsconfig.json`).

In alignment with product independence rules, the three client products (**Jules Extension**, **Jules Coding IDE**, **Jules Code CLI**) are built and packaged as independent artifacts sharing standard library entry points.

---

## 2. Key Components

1. **`package.json`**:
   - Defines system metadata (`name: jules-platform`, `version: 1.0.0`), entry point (`dist/server/index.js`), dependencies, devDependencies, and npm scripts.
   - Core npm scripts:
     - `npm run build`: Executes TypeScript compiler (`tsc`).
     - `npm test`: Executes Jest test suite (`jest --runInBand`).
     - `npm start`: Runs compiled platform server (`node dist/server/index.js`).
2. **`tsconfig.json`**:
   - Configures TypeScript target (`ES2022`), module resolution (`Node16` / `Node`), output directory (`dist`), strict type checking (`strict: true`), and declaration generation.
3. **Product Artifact Packaging**:
   - Platform Backend: Compiled Node.js bundle executable via `node dist/server/index.js`.
   - VS Code Extension: Packaged VSIX extension bundle referencing `vscode/extension/extension.ts`.
   - Jules Code CLI: Executable binary wrapped via `ts-node` or compiled bundle.

---

## 3. Build & Distribution Flow Diagram

```text
SOURCE FILES (*.ts)           TYPESCRIPT COMPILER (tsc)           OUTPUT ARTIFACTS (dist/)           DISTRIBUTION
       │                                 │                                │                           │
       │ server/index.ts                 │                                │                           │
       │ vscode/extension.ts             │                                │                           │
       ├────────────────────────────────►│                                │                           │
       │                                 │ Compile & Check Types          │                           │
       │                                 ├──────────────┐                 │                           │
       │                                 │ Emit JavaScript               │                           │
       │                                 ◄──────────────┘                 │                           │
       │                                 │                                │                           │
       │                                 │ Write JS + d.ts files          │                           │
       │                                 ├───────────────────────────────►│                           │
       │                                 │                                │ dist/server/index.js      │
       │                                 │                                │ dist/vscode/extension.js  │
       │                                 │                                ├──────────────────────────►│ Node.js Server
       │                                 │                                │                           │ VSIX Extension
       │                                 │                                │                           │ CLI Binary
```

---

## 4. Subsystem Package Dependencies

```json
{
  "dependencies": {
    "express": "^4.21.2",
    "ws": "^8.18.0",
    "better-sqlite3": "^11.8.0",
    "zod": "^3.24.2",
    "uuid": "^11.1.0"
  }
}
```

---

## 5. Known Issues & Edge Cases

1. **Native Addon Recompilation (`better-sqlite3`)**: Deploying across different operating systems or Node.js major versions requires running `npm rebuild better-sqlite3` to compile C++ bindings for the target OS kernel.
2. **Distribution Artifact Cleanliness**: Running `npm run build` overwrites existing files in `dist/`; stale files should be removed using `rm -rf dist` prior to production release packaging.

---

## 6. Related Notes
- [[Getting Started]] — Prerequisites and installation instructions.
- [[Features/Configuration]] — Runtime environment mode and port configuration.
- [[Features/Frontend UI]] — VS Code Extension packaging.
