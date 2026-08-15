export function activate(context: any) {
  console.log('Jules Platform VS Code Extension Activated');

  const commands = [
    'jules.newTask',
    'jules.startTask',
    'jules.addAgent',
    'jules.createTeam',
    'jules.approvePlan',
    'jules.pauseTask',
    'jules.takeOver',
    'jules.verify',
    'jules.reviewChanges',
    'jules.createPR',
    'jules.cancel',
    'jules.emergencyStop',
  ];

  return {
    extensionName: 'Jules Autonomous Engineering Platform',
    status: 'ACTIVE',
    registeredCommands: commands,
  };
}

export function deactivate() {
  console.log('Jules Platform VS Code Extension Deactivated');
}
