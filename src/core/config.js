import {readFile} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';

const requiredStrings = ['niche', 'geography', 'researchLanguage', 'contentLanguage', 'outputDirectory'];

export async function loadConfig(path) {
  const absolute = resolve(path);
  const value = JSON.parse(await readFile(absolute, 'utf8'));
  validateConfig(value);
  value.__configPath = absolute;
  value.outputDirectory = resolve(dirname(absolute), value.outputDirectory);
  for (const provider of value.providers) {
    if (provider.fixturePath) provider.fixturePath = resolve(dirname(absolute), provider.fixturePath);
  }
  return value;
}

export function validateConfig(value) {
  if (!value || typeof value !== 'object') throw new Error('Configuration must be a JSON object.');
  for (const field of requiredStrings) if (!value[field] || typeof value[field] !== 'string') throw new Error(`Configuration field "${field}" is required.`);
  for (const field of ['audiences', 'keywords', 'topics', 'providers']) if (!Array.isArray(value[field])) throw new Error(`Configuration field "${field}" must be an array.`);
  if (!value.providers.some((p) => p.enabled)) throw new Error('At least one provider must be enabled.');
  value.budgets ??= {};
  value.budgets.maxRequests ??= 20;
  value.budgets.maxCredits ??= 20;
  value.budgets.maxTokens ??= 0;
  value.cache ??= {enabled: true, ttlHours: 24};
  value.collection ??= {maxPagesPerQuery: 2, pageSize: 20, enrichTopItems: 8};
  value.recommendations ??= {max: 3, minEvidenceScore: 45, minIndependentSources: 2};
  value.recommendations.llm ??= {enabled:false,model:'gpt-4.1-mini',maxOutputTokens:800,apiKeyEnv:'OPENAI_API_KEY'};
  for (const [name, number] of Object.entries(value.budgets)) if (!Number.isFinite(number) || number < 0) throw new Error(`Budget ${name} must be a non-negative number.`);
  return value;
}
