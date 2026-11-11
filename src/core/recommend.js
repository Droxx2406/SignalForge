const average = (xs) => xs.length ? xs.reduce((a,b) => a+b,0)/xs.length : 0;
const uniq = (xs) => [...new Set(xs.filter(Boolean))];
const clean = (value) => String(value ?? '').trim().replace(/\s+/g,' ');

export function buildRecommendations(items, config) {
  const groups = new Map();
  for (const item of items.filter((i) => i.topic)) groups.set(item.topic,[...(groups.get(item.topic)??[]),item]);
  const candidates = [];
  for (const [topic, evidence] of groups) {
    const support=evidence.filter((i)=>i.stance!=='AGAINST'), counter=evidence.filter((i)=>i.stance==='AGAINST');
    const independent=new Set(support.filter((i)=>!i.isVendorClaim).map((i)=>`${i.provider}:${i.author.name}`));
    const evidenceScore=Math.round(average(support.map((i)=>i.evidenceScore.total)));
    if(evidenceScore<config.recommendations.minEvidenceScore||independent.size<config.recommendations.minIndependentSources)continue;
    const businessRelevance=Math.round(average(support.map((i)=>i.evidenceScore.dimensions.commercialRelevance)));
    const priorityScore=Math.round(evidenceScore*.55+businessRelevance*1.5+Math.min(independent.size,4)*3);
    const audience=config.audiences[0]??'Industry operators';
    const workflows=uniq(support.map((i)=>clean(i.workflow))).slice(0,2), problems=uniq(support.map((i)=>clean(i.problem))).slice(0,3), consequences=uniq(support.map((i)=>clean(i.consequence))).slice(0,2);
    const workflow=workflows[0]||topic, problem=problems[0]||`A documented ${topic} problem`, consequence=consequences[0]||'Decisions may be delayed';
    candidates.push({rank:0,priorityScore,topic,title:`${problem}: a practical check for ${topic}`,targetAudience:audience,
      primaryContentObjective:`Help ${audience} audit ${workflow} before adding another tool.`,businessRelevance:`The signal scored ${businessRelevance}/20 for relevance to the configured market and offering.`,sourceUrls:uniq(support.map((i)=>i.url)),
      evidence:{summary:problems,workflows,consequences,score:evidenceScore,rationale:`Average evidence quality ${evidenceScore}/100 across ${support.length} items and ${independent.size} independent non-vendor sources.`},
      interpretation:`The collected sources connect ${workflow} with ${problem.toLowerCase()} and ${consequence.toLowerCase()}.`,hypothesis:`A short audit of ${workflow} may help ${audience} identify whether the documented delay applies to them.`,opportunity:`Demonstrate how to map ${workflow}, measure when information becomes actionable, and test one simplification without claiming the issue is universal.`,uncertainty:'Public-source coverage is incomplete; evidence quality is not a prevalence estimate.',
      counterevidence:counter.map((i)=>({summary:i.problem||i.text.slice(0,180),url:i.url,score:i.evidenceScore.total})),contentAngle:`Walk through ${workflow}; pinpoint where ${problem.toLowerCase()}; then show a measurable check for ${consequence.toLowerCase()}.`,
      hooks:[`If ${problem.toLowerCase()}, map this step first.`,`How to audit ${workflow} before buying another tool.`,`${consequence}: the ${topic} check I would run first.`],
      talkingPoints:[`Map the real workflow: ${workflow}.`,`Name the observed failure: ${problem}.`,`Connect it to the documented consequence: ${consequence}.`,`Show one check: record input time, consolidation time, and when the result becomes actionable.`,counter.length?`Acknowledge the counterexample: ${clean(counter[0].problem||counter[0].text.slice(0,120))}.`:'Explain that the sources do not establish market prevalence.'],
      suggestedDemonstration:`Use synthetic data to recreate ${workflow}; timestamp each handoff and highlight the point that produces “${consequence}”.`,suggestedCta:`Ask ${audience} which step in ${workflow} takes longest and why.`,priorityRationale:'Ranked on evidence quality, independent corroboration, configured relevance, and practical usefulness.',recordingBrief:{format:'Founder-led workflow teardown with a synthetic demonstration',durationSeconds:60,show:[workflow,problem,`A timestamped check for: ${consequence}`],avoid:['Unsupported prevalence claims','Vendor claims presented as operator evidence']}});
  }
  const selected=candidates.sort((a,b)=>b.priorityScore-a.priorityScore).slice(0,config.recommendations.max).map((r,index)=>({...r,rank:index+1}));
  const seen=new Set();for(const rec of selected)rec.hooks=rec.hooks.filter((hook)=>{const key=clean(hook).toLowerCase();if(!key||seen.has(key))return false;seen.add(key);return true;}).slice(0,3);
  return selected;
}
