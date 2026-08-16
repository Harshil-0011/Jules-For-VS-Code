import express from 'express';
import { DatabaseService } from '../persistence/database';
import { CommandBus } from '../commands/command_bus';
import { ExecutionBroker } from '../execution/execution_broker';
import { MergeCoordinator } from '../merge/merge_coordinator';
import { v4 as uuidv4 } from 'uuid';

export function createApiGateway(
  dbService: DatabaseService,
  commandBus: CommandBus,
  executionBroker: ExecutionBroker,
  mergeCoordinator: MergeCoordinator
): express.Application {
  const app = express();
  app.use(express.json());

  const db = dbService.getDb();

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

    res.status(201).json({ taskId, status: 'CREATED' });
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
