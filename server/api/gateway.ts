import express from 'express';
import { DatabaseService } from '../persistence/database';
import { CommandBus } from '../commands/command_bus';
import { ExecutionBroker } from '../execution/execution_broker';
import { MergeCoordinator } from '../merge/merge_coordinator';
import { JulesAdapter } from '../jules/jules_adapter';
import { v4 as uuidv4 } from 'uuid';

export function createApiGateway(
  dbService: DatabaseService,
  commandBus: CommandBus,
  executionBroker: ExecutionBroker,
  mergeCoordinator: MergeCoordinator,
  julesAdapter?: JulesAdapter
): express.Application {
  const app = express();
  app.use(express.json());

  const db = dbService.getDb();
  const adapter = julesAdapter || new JulesAdapter(process.env.JULES_API_KEY || 'mock-jules-key');

  app.get('/api/v1/capabilities', (req, res) => {
    res.json({
      provider: adapter.getProviderName(),
      capabilities: adapter.getCapabilities(),
    });
  });

  app.get('/api/v1/sources', async (req, res) => {
    const sources = await adapter.listSources();
    res.json({ sources });
  });

  app.get('/api/v1/tasks', (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    res.json({ tasks });
  });

  app.post('/api/v1/tasks', async (req, res) => {
    const { title, description, riskLevel, budget } = req.body;
    const taskId = uuidv4();
    const tenantId = req.headers['x-tenant-id']?.toString() || 'default-tenant';

    db.prepare(`
      INSERT INTO tasks (id, tenant_id, project_id, title, description, status, risk_level, budget_json)
      VALUES (?, ?, 'default-project', ?, ?, 'CREATED', ?, ?)
    `).run(
      taskId,
      tenantId,
      title || 'Untitled Task',
      description || '',
      riskLevel || 'LOW',
      JSON.stringify(budget || { maxRuntimeSec: 3600, maxToolCalls: 100, maxCostUsd: 10, maxRetries: 3 })
    );

    const session = await adapter.createSession(taskId, 'lead-agent');

    res.status(201).json({ taskId, sessionId: session.sessionId, status: 'CREATED' });
  });

  app.post('/api/v1/sessions', async (req, res) => {
    const { taskId, role, sourceContext, prompt, automationMode } = req.body;
    if (sourceContext && prompt) {
      const session = await adapter.createSessionWithSourceContext(sourceContext, prompt, automationMode);
      return res.status(201).json({ session });
    }
    const session = await adapter.createSession(taskId || uuidv4(), role || 'lead-agent');
    res.status(201).json({ session });
  });

  app.get('/api/v1/sessions/:id', async (req, res) => {
    try {
      const session = await adapter.getSession(req.params.id);
      res.json({ session });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.post('/api/v1/sessions/:id/messages', async (req, res) => {
    try {
      const { message } = req.body;
      const activity = await adapter.sendMessage(req.params.id, message || '');
      res.json({ activity });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/v1/sessions/:id/activities', async (req, res) => {
    const activities = await adapter.listActivities(req.params.id);
    res.json({ sessionId: req.params.id, activities });
  });

  app.post('/api/v1/sessions/:id/reconcile', async (req, res) => {
    try {
      const reconciliation = await adapter.reconcileSession(req.params.id);
      res.json({ reconciliation });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/v1/emergency-stop', (req, res) => {
    executionBroker.triggerEmergencyStop();
    res.json({ status: 'EMERGENCY_STOP_ACTIVATED' });
  });

  app.post('/api/v1/emergency-stop/reset', (req, res) => {
    executionBroker.resetEmergencyStop();
    res.json({ status: 'EMERGENCY_STOP_RESET' });
  });

  app.post('/api/v1/tasks/:id/merge', async (req, res) => {
    const taskId = req.params.id;
    const { changeDescription, filesTouched, hasHumanApproval } = req.body;

    const result = await mergeCoordinator.evaluateMerge(
      taskId,
      changeDescription || 'Task completion',
      filesTouched || [],
      !!hasHumanApproval
    );

    res.json(result);
  });

  return app;
}
