import { activate, deactivate, WorkspaceAdapter, GitAdapter, EventClient } from '../../vscode/extension/extension';

describe('VS Code Extension - Canonical Architecture Phase 5', () => {
  it('should activate extension and expose adapters and commands', () => {
    const ext = activate();
    expect(ext.extensionName).toBe('Jules Extension');
    expect(ext.version).toBe('4.0.0');
    expect(ext.status).toBe('ACTIVE');
    expect(ext.registeredCommands).toContain('jules.newTask');
    expect(ext.registeredCommands).toContain('jules.getTaskView');
    expect(ext.registeredCommands).toContain('jules.getDiffView');
  });

  it('should support WorkspaceAdapter discovery', () => {
    const adapter = new WorkspaceAdapter('/mock/workspace');
    const info = adapter.discoverWorkspace();
    expect(info.rootPath).toBe('/mock/workspace');
    expect(info.projectName).toBe('workspace');
    expect(info.hasGitRepo).toBe(true);
    expect(info.packageManager).toBe('npm');
  });

  it('should support GitAdapter state extraction', () => {
    const gitAdapter = new GitAdapter();
    const state = gitAdapter.getGitState();
    expect(state.branch).toBe('main');
    expect(state.isClean).toBe(true);
  });

  it('should handle EventClient connection and events', () => {
    const client = new EventClient();
    expect(client.isConnected()).toBe(false);
    client.connect('http://localhost:3000');
    expect(client.isConnected()).toBe(true);

    let received = false;
    client.on('taskUpdated', (data: any) => {
      received = data.updated;
    });
    client.emit('taskUpdated', { updated: true });
    expect(received).toBe(true);

    client.disconnect();
    expect(client.isConnected()).toBe(false);
  });

  it('should execute extension commands and update UI states', () => {
    const ext = activate();
    const newRes = ext.executeCommand('jules.newTask', { taskId: 'task-101' });
    expect(newRes.status).toBe('TASK_CREATED');
    expect(newRes.taskId).toBe('task-101');

    const taskView = ext.executeCommand('jules.getTaskView');
    expect(taskView.activeTaskId).toBe('task-101');
    expect(taskView.status).toBe('RUNNING');

    const diffView = ext.executeCommand('jules.getDiffView');
    expect(diffView.gitState.branch).toBe('main');

    const emergencyRes = ext.executeCommand('jules.emergencyStop');
    expect(emergencyRes.status).toBe('EMERGENCY_STOP_TRIGGERED');
    expect(ext.state.emergencyStop).toBe(true);
  });

  it('should log deactivation message cleanly', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    deactivate();
    expect(consoleSpy).toHaveBeenCalledWith('Jules Platform VS Code Extension Deactivated');
    consoleSpy.mockRestore();
  });
});
