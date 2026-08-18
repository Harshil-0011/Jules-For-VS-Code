import { v4 as uuidv4 } from 'uuid';

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  branch: string;
  baseBranch: string;
  status: 'OPEN' | 'MERGED' | 'CLOSED';
  htmlUrl: string;
}

export class GitHubProvider {
  private prs = new Map<number, PullRequest>();
  private nextPrNumber = 101;

  constructor(private token: string) {}

  public async createPullRequest(title: string, branch: string, baseBranch = 'main'): Promise<PullRequest> {
    const prNumber = this.nextPrNumber++;
    const pr: PullRequest = {
      id: uuidv4(),
      number: prNumber,
      title,
      branch,
      baseBranch,
      status: 'OPEN',
      htmlUrl: `https://github.com/example/repo/pull/${prNumber}`,
    };

    this.prs.set(prNumber, pr);
    return pr;
  }

  public async getPullRequest(number: number): Promise<PullRequest> {
    const pr = this.prs.get(number);
    if (!pr) {
      throw new Error(`Pull Request #${number} not found`);
    }
    return pr;
  }

  public async mergePullRequest(number: number): Promise<boolean> {
    const pr = await this.getPullRequest(number);
    pr.status = 'MERGED';
    this.prs.set(number, pr);
    return true;
  }
}
