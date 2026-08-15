import { AgentProvider } from '../providers/agent_provider';

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

export class TeamOrchestrator {
  private providers = new Map<string, AgentProvider>();

  public registerProvider(provider: AgentProvider): void {
    this.providers.set(provider.getProviderName(), provider);
  }

  public getProvider(name: string): AgentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not registered`);
    }
    return provider;
  }
}
