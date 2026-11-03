import OpenAI from 'openai';
import { env } from '../config/env';
import { DefectContext, DefectSeverity, JiraBugDraft } from '../types/defect';

export class OpenAIClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey: string = env.openAiApiKey, model: string = env.openAiModel) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('OPENAI_API_KEY is not configured.');
    }

    this.client = new OpenAI({ apiKey });
    this.model = model || 'gpt-4o';
  }

  async generateJiraBugDraft(defect: DefectContext): Promise<JiraBugDraft> {
    const prompt = `
      You are a QA automation assistant. Write a high-quality Jira bug draft for a Playwright test failure.

      Inputs:
      - Test Name: ${defect.testName}
      - Error Message: ${defect.errorMessage}
      - Screenshot Path: ${defect.screenshotPath ?? 'Not available'}
      - Page URL: ${defect.pageUrl ?? 'Not available'}

      Requirements:
      1. Return valid JSON only in this exact structure:
      {
        "summary": "string",
        "description": "string",
        "severity": "CRITICAL|HIGH|MEDIUM|LOW"
      }
      2. The summary should be concise and Jira-ready.
      3. The description must explain the issue, reproduction evidence, affected test, and screenshot path.
      4. Severity must be one of CRITICAL, HIGH, MEDIUM, LOW.
      5. Keep the description suitable for Jira issue body content.
    `;

    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You generate Jira-ready bug reports based on test failures.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error('OpenAI returned an empty response.');
    }

    return this.parseResponse(rawContent);
  }

  private parseResponse(rawContent: string): JiraBugDraft {
    const normalized = rawContent.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(normalized) as Partial<JiraBugDraft>;

    const summary = String(parsed.summary ?? 'Playwright test failure').trim();
    const description = String(parsed.description ?? 'Playwright automation failure.').trim();
    const severity = this.normalizeSeverity(parsed.severity ?? 'MEDIUM');

    return {
      summary,
      description,
      severity,
    };
  }

  private normalizeSeverity(value: string): DefectSeverity {
    const candidate = value.toUpperCase();
    if (candidate === 'CRITICAL') return 'CRITICAL';
    if (candidate === 'HIGH') return 'HIGH';
    if (candidate === 'LOW') return 'LOW';
    return 'MEDIUM';
  }
}
