import * as path from 'path';
import { JulesAdapter } from '../../server/jules/jules_adapter';

export interface IDEShell {
  appName: string;
  version: string;
  activeWorkspacePath: string;
  editorOpenFiles: string[];
}

export function activateIDE(workspacePath: string = process.cwd()): IDEShell {
  console.log('Jules Coding IDE (Product 2) Shell Active');
  return {
    appName: 'Jules Coding IDE',
    version: '4.0.0',
    activeWorkspacePath: workspacePath,
    editorOpenFiles: [],
  };
}
