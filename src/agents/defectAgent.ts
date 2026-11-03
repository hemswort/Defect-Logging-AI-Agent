import { JiraClient } from '../clients/jiraClient';
import { OpenAIClient } from '../clients/openAIClient';
import { env } from '../config/env';
import { DefectContext, DefectLogResult } from '../types/defect';

export class DefectAgent {
  constructor(
    private readonly openAIClient: OpenAIClient = new OpenAIClient(),
    private readonly jiraClient: JiraClient = new JiraClient(),
  ) {}

  async processFailure(defect: DefectContext): Promise<DefectLogResult> {
    const draft = await this.openAIClient.generateJiraBugDraft(defect);
    const issue = await this.jiraClient.createBug(draft, defect);

    return {
      summary: draft.summary,
      description: draft.description,
      severity: draft.severity,
      jiraIssueKey: issue.key,
      jiraIssueUrl: `${env.jiraBaseUrl}/browse/${issue.key}`,
    };
  }
}

export async function runDefectAgent(defect: DefectContext): Promise<DefectLogResult> {
  const agent = new DefectAgent();
  return agent.processFailure(defect);
}
