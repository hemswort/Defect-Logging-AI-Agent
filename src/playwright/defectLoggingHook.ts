import { Page, TestInfo, test } from '@playwright/test';
import { runDefectAgent } from '../agents/defectAgent';
import { env } from '../config/env';
import { DefectContext } from '../types/defect';

export async function triggerDefectLogging(page: Page | null, testInfo: TestInfo): Promise<void> {
  if (testInfo.status !== 'failed' || !env.defectLoggingEnabled) {
    return;
  }

  try {
    const screenshotPath = testInfo.outputPath('ai-defect-failure.png');

    if (page) {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    const defect: DefectContext = {
      testName: testInfo.title,
      errorMessage: testInfo.error?.message ?? 'No error message captured.',
      screenshotPath,
      pageUrl: page ? page.url() : undefined,
    };

    const result = await runDefectAgent(defect);

    console.log(
      `[Defect Agent] Jira bug created successfully: ${result.jiraIssueKey ?? 'N/A'} - ${result.jiraIssueUrl ?? 'N/A'}`,
    );
  } catch (error) {
    console.warn('[Defect Agent] Failed to log defect to Jira:', error);
  }
}

export function registerDefectLoggingHooks(): void {
  test.afterEach(async ({ page }, testInfo) => {
    await triggerDefectLogging(page, testInfo);
  });
}
