import express from 'express';
import http from 'http';
import { DatabaseService } from '../../server/persistence/database';
import { CommandBus } from '../../server/commands/command_bus';
import { ExecutionBroker } from '../../server/execution/execution_broker';
import { MergeCoordinator } from '../../server/merge/merge_coordinator';
import { PolicyEngine } from '../../server/policies/policy_engine';
import { RiskEngine } from '../../server/policies/risk_engine';
import { BudgetManager } from '../../server/budgets/budget_manager';
import { GitManager } from '../../server/git/git_manager';
import { VerificationEngine } from '../../server/verification/verification_engine';
import { JulesAdapter } from '../../server/jules/jules_adapter';
import { createApiGateway } from '../../server/api/gateway';

describe('Full-Stack API Gateway & End-to-End Control Plane (Phase 6 Integration)', () => {
  let dbService: DatabaseService;
  let commandBus: CommandBus;
  let policyEngine: PolicyEngine;
  let riskEngine: RiskEngine;
  let budgetManager: BudgetManager;
  let gitManager: GitManager;
  let verificationEngine: VerificationEngine;
  let executionBroker: ExecutionBroker;
  let mergeCoordinator: MergeCoordinator;
  let julesAdapter: JulesAdapter;
  let app: express.Application;
  let server: http.Server;
  let baseUrl: string;

  beforeAll((done) => {
    dbService = new DatabaseService(':memory:');
    commandBus = new CommandBus(dbService.getDb());
    policyEngine = new PolicyEngine();
    riskEngine = new RiskEngine();
    budgetManager = new BudgetManager();
    gitManager = new GitManager();
    verificationEngine = new VerificationEngine(dbService.getDb());

    executionBroker = new ExecutionBroker(policyEngine, budgetManager);
    mergeCoordinator = new MergeCoordinator(gitManager, verificationEngine, policyEngine, riskEngine);
    julesAdapter = new JulesAdapter('test-api-key', 'https://jules.googleapis.com/v1alpha');

    app = createApiGateway(dbService, commandBus, executionBroker, mergeCoordinator, julesAdapter);

    server = app.listen(0, () => {
      const address: any = server.address();
      baseUrl = `http://localhost:${address.port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(() => {
      dbService.close();
      done();
    });
  });

  it('should expose provider capabilities via GET /api/v1/capabilities', async () => {
    const res = await fetch(`${baseUrl}/api/v1/capabilities`);
    const data: any = await res.json();
    expect(res.status).toBe(200);
    expect(data.provider).toBe('google-jules');
    expect(data.capabilities).toContain('cloud_vm_sandbox');
  });

  it('should list connected sources via GET /api/v1/sources', async () => {
    const res = await fetch(`${baseUrl}/api/v1/sources`);
    const data: any = await res.json();
    expect(res.status).toBe(200);
    expect(data.sources.length).toBeGreaterThan(0);
    expect(data.sources[0].id).toBe('sources/github/default/repo');
  });

  it('should create tasks and initialize Jules sessions via POST /api/v1/tasks', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Full-stack Auth End-to-End',
        description: 'Implement JWT middleware',
        riskLevel: 'HIGH',
      }),
    });
    const data: any = await res.json();

    expect(res.status).toBe(201);
    expect(data.taskId).toBeDefined();
    expect(data.sessionId).toBeDefined();
    expect(data.status).toBe('CREATED');
  });

  it('should process user messages and record session activities via POST /api/v1/sessions/:id/messages', async () => {
    const taskRes = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Chat Task' }),
    });
    const taskData: any = await taskRes.json();
    const sessionId = taskData.sessionId;

    const msgRes = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Refactor database persistence' }),
    });
    const msgData: any = await msgRes.json();

    expect(msgRes.status).toBe(200);
    expect(msgData.activity.content).toContain('Refactor database persistence');

    const actRes = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}/activities`);
    const actData: any = await actRes.json();
    expect(actRes.status).toBe(200);
    expect(actData.activities.length).toBeGreaterThanOrEqual(2);
  });

  it('should trigger and reset emergency stop via gateway endpoints', async () => {
    const triggerRes = await fetch(`${baseUrl}/api/v1/emergency-stop`, { method: 'POST' });
    const triggerData: any = await triggerRes.json();
    expect(triggerRes.status).toBe(200);
    expect(triggerData.status).toBe('EMERGENCY_STOP_ACTIVATED');
    expect(executionBroker.isEmergencyStopped()).toBe(true);

    const resetRes = await fetch(`${baseUrl}/api/v1/emergency-stop/reset`, { method: 'POST' });
    const resetData: any = await resetRes.json();
    expect(resetRes.status).toBe(200);
    expect(resetData.status).toBe('EMERGENCY_STOP_RESET');
    expect(executionBroker.isEmergencyStopped()).toBe(false);
  });
});
