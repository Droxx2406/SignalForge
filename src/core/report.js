import {mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

export async function writeReports(result, directory) {
  await mkdir(directory,{recursive:true});
  const jsonPath=join(directory,'research-report.json');
  const markdownPath=join(directory,'research-report.md');
  await writeFile(jsonPath,JSON.stringify(result,null,2)+'\n','utf8');
  const lines=['# SignalForge Research Report','',`Generated: ${result.generatedAt}`,'',`Evidence: ${result.summary.evidenceItems}; recommendations: ${result.recommendations.length}.`,'','## Coverage',''];
  for(const c of result.coverage) lines.push(`- ${c.provider}: ${c.status}; ${c.items} items${c.error?`; ${c.error}`:''}`);
  lines.push('','## Recommendations','');
  if(!result.recommendations.length) lines.push('No recommendation met the configured evidence threshold.');
  for(const r of result.recommendations){ lines.push(`### ${r.rank}. ${r.title}`,'',`Audience: ${r.targetAudience}`,'',`Evidence score: ${r.evidence.score}/100`,'',`Evidence: ${r.evidence.summary.join(' | ')}`,'',`Interpretation: ${r.interpretation}`,'',`Hypothesis: ${r.hypothesis}`,'',`Opportunity: ${r.opportunity}`,'',`Uncertainty: ${r.uncertainty}`,'',`Sources: ${r.sourceUrls.join(', ')}`,'',`Hooks: ${r.hooks.join(' | ')}`,'',`Talking points: ${r.talkingPoints.join(' | ')}`,'',`Demonstration: ${r.suggestedDemonstration}`,'',`CTA: ${r.suggestedCta}`,''); }
  lines.push('## Budget','',`Requests: ${result.budget.used.requests}/${result.budget.limits.requests}; credits: ${result.budget.used.credits}/${result.budget.limits.credits}; tokens: ${result.budget.used.tokens}/${result.budget.limits.tokens}.`,'');
  await writeFile(markdownPath,lines.join('\n'),'utf8');
  return {jsonPath,markdownPath};
}
