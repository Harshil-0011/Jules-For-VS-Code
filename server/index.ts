import { DatabaseService } from './persistence/database';
import { CommandBus } from './commands/command_bus';
import { ExecutionBroker } from './execution/execution_broker';
import { PolicyEngine } from './policies/policy_engine';
import { RiskEngine } from './policies/risk_engine';
import { BudgetManager } from './budgets/budget_manager';
import { GitManager } from './git/git_manager';
import { VerificationEngine } from './verification/verification_engine';
import { MergeCoordinator } from './merge/merge_coordinator';
import { createApiGateway } from './api/gateway';
import { EventStreamServer } from './events/websocket_server';
import http from 'http';

export function startServer(port: number = 3000) {
  const dbService = new DatabaseService(':memory:');
  const db = dbService.getDb();

  const commandBus = new CommandBus(db);
  const policyEngine = new PolicyEngine();
  const riskEngine = new RiskEngine();
  const budgetManager = new BudgetManager();
  const executionBroker = new ExecutionBroker(policyEngine, budgetManager);
  const gitManager = new GitManager();
  const verificationEngine = new VerificationEngine(db);
  const mergeCoordinator = new MergeCoordinator(gitManager, verificationEngine, policyEngine, riskEngine);

  const app = createApiGateway(dbService, commandBus, executionBroker, mergeCoordinator);
  const server = http.createServer(app);
  const wsServer = new EventStreamServer(server);

  return new Promise<{ server: http.Server; dbService: DatabaseService }>((resolve) => {
    server.listen(port, () => {
      resolve({ server, dbService });
    });
  });
}
