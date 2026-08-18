export function activate(context: any) {
  console.log('Jules Autonomous Software Engineering Platform Extension Active');

  const registeredCommands: { [key: string]: Function } = {
    'jules.newTask': () => ({ status: 'TASK_CREATED' }),
    'jules.startTask': () => ({ status: 'TASK_STARTED' }),
    'jules.addAgent': () => ({ status: 'AGENT_ADDED' }),
    'jules.createTeam': () => ({ status: 'TEAM_CREATED' }),
    'jules.approvePlan': () => ({ status: 'PLAN_APPROVED' }),
    'jules.pauseTask': () => ({ status: 'TASK_PAUSED' }),
    'jules.takeOver': () => ({ status: 'HUMAN_TAKEOVER_ACTIVE' }),
    'jules.verify': () => ({ status: 'VERIFICATION_DISPATCHED' }),
    'jules.reviewChanges': () => ({ status: 'CHANGES_REVIEWED' }),
    'jules.createPR': () => ({ status: 'PR_CREATED' }),
    'jules.cancel': () => ({ status: 'TASK_CANCELLED' }),
    'jules.emergencyStop': () => ({ status: 'EMERGENCY_STOP_TRIGGERED' }),
  };

  return {
    extensionName: 'Jules Autonomous Engineering Platform',
    status: 'ACTIVE',
    registeredCommands: Object.keys(registeredCommands),
    executeCommand: (cmdName: string) => {
      const fn = registeredCommands[cmdName];
      if (!fn) throw new Error(`VS Code extension command not found: ${cmdName}`);
      return fn();
    },
  };
}

export function deactivate() {
  console.log('Jules Platform VS Code Extension Deactivated');
}
