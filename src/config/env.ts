import dotenv from 'dotenv';

dotenv.config();

export const env = {
  openAiApiKey: process.env.OPENAI_API_KEY ?? '',
  openAiModel: process.env.OPENAI_MODEL ?? 'gpt-4o',
  jiraBaseUrl: process.env.JIRA_BASE_URL ?? '',
  jiraEmail: process.env.JIRA_EMAIL ?? '',
  jiraApiToken: process.env.JIRA_API_TOKEN ?? '',
  jiraProjectKey: process.env.JIRA_PROJECT_KEY ?? '',
  jiraIssueType: process.env.JIRA_ISSUE_TYPE ?? 'Bug',
  defectLoggingEnabled: (process.env.DEFECT_LOGGING_ENABLED ?? 'true').toLowerCase() === 'true',
};
