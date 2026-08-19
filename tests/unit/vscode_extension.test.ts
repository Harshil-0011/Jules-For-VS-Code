import * as fs from 'fs';
import * as path from 'path';
import { activate, deactivate, WorkspaceAdapter, GitAdapter, EventClient } from '../../vscode/extension/extension';

describe('VS Code Extension - Canonical Architecture Phase 5', () => {
  const tmpWorkspace = path.join(process.cwd(), '.tmp_test_workspace');

  beforeAll(() => {
    if (!fs.existsSync(tmpWorkspace)) {
      fs.mkdirSync(tmpWorkspace, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tmpWorkspace)) {
      fs.rmSync(tmpWorkspace, { recursive: true, force: true });
    }
  });

  it('should activate extension and expose adapters and commands', () => {
    const ext = activate();
    expect(ext.extensionName).toBe('Jules Extension');
    expect(ext.version).toBe('4.0.0');
    expect(ext.status).toBe('ACTIVE');
    expect(ext.registeredCommands).toContain('jules.newTask');
    expect(ext.registeredCommands).toContain('jules.getTaskView');
    expect(ext.registeredCommands).toContain('jules.getDiffView');
  });

  it('should support WorkspaceAdapter discovery and file creation on host PC', () => {
    const adapter = new WorkspaceAdapter(tmpWorkspace);
    const info = adapter.discoverWorkspace();
    expect(info.rootPath).toBe(tmpWorkspace);
    expect(info.projectName).toBe('.tmp_test_workspace');

    const createdFilePath = adapter.createTaskFile('test-task-1', { title: 'Test Task' });
    expect(fs.existsSync(createdFilePath)).toBe(true);

    const content = JSON.parse(fs.readFileSync(createdFilePath, 'utf-8'));
    expect(content.title).toBe('Test Task');
  });

  it('should support GitAdapter state extraction', () => {
    const gitAdapter = new GitAdapter();
    const state = gitAdapter.getGitState();
    expect(state.branch).toBeDefined();
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

  it('should execute extension commands and persist task files to disk', () => {
    const ext = activate();
    const newRes = ext.executeCommand('jules.newTask', { taskId: 'task-persistent-1', title: 'Real Task' });
    expect(newRes.status).toBe('TASK_CREATED');
    expect(newRes.taskId).toBe('task-persistent-1');
    expect(fs.existsSync(newRes.filePath)).toBe(true);

    const taskView = ext.executeCommand('jules.getTaskView');
    expect(taskView.activeTaskId).toBe('task-persistent-1');
    expect(taskView.status).toBe('RUNNING');

    const diffView = ext.executeCommand('jules.getDiffView');
    expect(diffView.gitState).toBeDefined();

    const emergencyRes = ext.executeCommand('jules.emergencyStop');
    expect(emergencyRes.status).toBe('EMERGENCY_STOP_TRIGGERED');
    expect(ext.state.emergencyStop).toBe(true);

    // Cleanup generated task file in default workspace
    if (fs.existsSync(newRes.filePath)) {
      fs.unlinkSync(newRes.filePath);
    }
  });

  it('should log deactivation message cleanly', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    deactivate();
    expect(consoleSpy).toHaveBeenCalledWith('Jules Platform VS Code Extension Deactivated');
    consoleSpy.mockRestore();
  });
});
