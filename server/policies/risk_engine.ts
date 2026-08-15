import { RiskLevel } from '../tasks/models';

export class RiskEngine {
  public classifyRisk(changeDescription: string, filesTouched: string[]): RiskLevel {
    const desc = changeDescription.toLowerCase();

    const isAuth = filesTouched.some((f) => f.includes('auth') || f.includes('jwt') || f.includes('secret')) || desc.includes('auth') || desc.includes('password');
    const isDb = filesTouched.some((f) => f.includes('schema') || f.includes('migration')) || desc.includes('migration');
    const isInfra = filesTouched.some((f) => f.includes('docker') || f.includes('terraform') || f.includes('.github'));

    if (isAuth || desc.includes('security boundary')) {
      return 'CRITICAL';
    }
    if (isDb || isInfra) {
      return 'HIGH';
    }
    if (filesTouched.length > 10) {
      return 'MEDIUM';
    }

    return 'LOW';
  }
}
