import { DatabaseService } from '../../server/persistence/database';
import { ContextEngine } from '../../server/context/context_engine';
import { AgentRegistry, TeamOrchestrator } from '../../server/teams/team';
import { JulesAdapter } from '../../server/jules/jules_adapter';
import { activate } from '../../apps/jules-extension/extension/extension';

describe('Phase 6-10 Verification, Memory, Multi-Agent & VS Code', () => {
  let dbService: DatabaseService;
  let contextEngine: ContextEngine;

  beforeEach(() => {
    dbService = new DatabaseService(':memory:');
    contextEngine = new ContextEngine(dbService.getDb());
  });

  afterEach(() => {
    dbService.close();
  });

  it('should store and retrieve persistent context memory across scope', () => {
    contextEngine.store({
      id: 'mem-1',
      scope: 'PROJECT',
      scopeId: 'proj-100',
      key: 'arch_style',
      value: 'modular_monolith',
      provenance: { sourceTaskId: 'task-1', timestamp: new Date().toISOString() },
    });

    const results = contextEngine.query('PROJECT', 'proj-100');
    expect(results.length).toBe(1);
    expect(results[0].key).toBe('arch_style');
    expect(results[0].value).toBe('modular_monolith');
  });

  it('should orchestrate heterogeneous multi-agent teams via AgentRegistry', () => {
    const registry = new AgentRegistry();
    const jules = new JulesAdapter('key', 'https://jules.googleapis.com/v1alpha');
    registry.registerProvider(jules);

    registry.registerAgent({
      agentId: 'jules-lead',
      providerName: 'google-jules',
      role: 'LEAD',
    });

    const orchestrator = new TeamOrchestrator(registry);
    const team = orchestrator.createTeam('team-1', 'tenant-1', 'Core Engineering Team', [
      { agentId: 'jules-lead', providerName: 'google-jules', role: 'LEAD' },
    ]);

    expect(team.name).toBe('Core Engineering Team');
    expect(team.members.length).toBe(1);
  });

  it('should activate VS Code extension and execute commands', async () => {
    const ext = activate({});
    expect(ext.status).toBe('ACTIVE');
    expect(ext.registeredCommands).toContain('jules.emergencyStop');

    const result = await ext.executeCommand('jules.emergencyStop');
    expect(result.status).toBe('EMERGENCY_STOP_TRIGGERED');
  });
});
