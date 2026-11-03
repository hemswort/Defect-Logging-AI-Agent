export type DefectSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface DefectContext {
  testName: string;
  errorMessage: string;
  screenshotPath?: string;
  pageUrl?: string;
}

export interface JiraBugDraft {
  summary: string;
  description: string;
  severity: DefectSeverity;
}

export interface DefectLogResult extends JiraBugDraft {
  jiraIssueKey?: string;
  jiraIssueUrl?: string;
}

export interface JiraIssueResponse {
  id: string;
  key: string;
  self: string;
}
