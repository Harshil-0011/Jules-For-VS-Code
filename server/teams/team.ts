import { AgentProvider } from '../providers/agent_provider';

export interface AgentDefinition {
  agentId: string;
  providerName: string;
  role: 'LEAD' | 'PLANNER' | 'BACKEND_WORKER' | 'FRONTEND_WORKER' | 'SECURITY_REVIEWER' | 'TEST_ENGINEER';
}

export interface TeamMember {
  agentId: string;
  providerName: string;
  role: 'LEAD' | 'PLANNER' | 'BACKEND_WORKER' | 'FRONTEND_WORKER' | 'SECURITY_REVIEWER' | 'TEST_ENGINEER';
}

export interface Team {
  id: string;
  tenantId: string;
  name: string;
  members: TeamMember[];
}

export class AgentRegistry {
  private providers = new Map<string, AgentProvider>();
  private definitions = new Map<string, AgentDefinition>();

  public registerProvider(provider: AgentProvider): void {
    this.providers.set(provider.getProviderName(), provider);
  }

  public registerAgent(def: AgentDefinition): void {
    this.definitions.set(def.agentId, def);
  }

  public getProvider(name: string): AgentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not registered in registry`);
    }
    return provider;
  }

  public listAgents(): AgentDefinition[] {
    return Array.from(this.definitions.values());
  }
}

export class TeamOrchestrator {
  constructor(private registry: AgentRegistry) {}

  public createTeam(id: string, tenantId: string, name: string, members: TeamMember[]): Team {
    for (const member of members) {
      this.registry.getProvider(member.providerName); // Validate provider is registered
    }

    return { id, tenantId, name, members };
  }
}
