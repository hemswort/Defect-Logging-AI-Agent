import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import { DefectContext, DefectSeverity, JiraBugDraft, JiraIssueResponse } from '../types/defect';

export class JiraClient {
  private readonly client: AxiosInstance;
  private readonly projectKey: string;
  private readonly issueType: string;

  constructor(baseUrl: string = env.jiraBaseUrl, email: string = env.jiraEmail, apiToken: string = env.jiraApiToken) {
    if (!baseUrl || baseUrl.trim() === '') {
      throw new Error('JIRA_BASE_URL is not configured.');
    }

    if (!email || email.trim() === '') {
      throw new Error('JIRA_EMAIL is not configured.');
    }

    if (!apiToken || apiToken.trim() === '') {
      throw new Error('JIRA_API_TOKEN is not configured.');
    }

    this.projectKey = env.jiraProjectKey || 'DEMO';
    this.issueType = env.jiraIssueType || 'Bug';

    const basicAuth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  async createBug(draft: JiraBugDraft, defect: DefectContext): Promise<JiraIssueResponse> {
    if (!this.projectKey || this.projectKey.trim() === '') {
      throw new Error('JIRA_PROJECT_KEY is not configured.');
    }

    const payload = {
      fields: {
        project: { key: this.projectKey },
        summary: draft.summary,
        description: this.buildJiraDescription(defect, draft.description),
        issuetype: { name: this.issueType },
        labels: ['playwright', 'automation', 'ai-generated'],
        priority: { name: this.mapSeverityToPriority(draft.severity) },
      },
    };

    const response = await this.client.post('/rest/api/3/issue', payload);
    return response.data as JiraIssueResponse;
  }

  private buildJiraDescription(defect: DefectContext, extraDescription: string) {
    const content = [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: `Test: ${defect.testName}` }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: `Error: ${defect.errorMessage}` }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: `Details: ${extraDescription}` }],
      },
    ];

    if (defect.screenshotPath) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: `Screenshot: ${defect.screenshotPath}` }],
      });
    }

    if (defect.pageUrl) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: `Page URL: ${defect.pageUrl}` }],
      });
    }

    return {
      type: 'doc',
      version: 1,
      content,
    };
  }

  private mapSeverityToPriority(severity: DefectSeverity): string {
    switch (severity) {
      case 'CRITICAL':
        return 'Highest';
      case 'HIGH':
        return 'High';
      case 'MEDIUM':
        return 'Medium';
      case 'LOW':
        return 'Low';
      default:
        return 'Medium';
    }
  }
}
