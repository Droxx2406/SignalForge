import {join} from 'node:path';
import {BudgetTracker} from './core/budget.js';
import {FileCache} from './core/cache.js';
import {HttpClient} from './core/http.js';
import {deduplicate} from './core/dedupe.js';
import {scoreEvidence} from './core/scoring.js';
import {buildRecommendations} from './core/recommend.js';
import {synthesizeRecommendations} from './core/synthesize.js';
import {createProvider} from './providers/index.js';
import {writeReports} from './core/report.js';

export async function runResearch(config,{fetchImpl=fetch}={}) {
  const budget=new BudgetTracker(config.budgets);
  const cache=new FileCache({directory:join(config.outputDirectory,'.cache'),...config.cache});
  const http=new HttpClient({budget,cache,fetchImpl,...config.http});
  const collected=[],coverage=[];
  for(const options of config.providers.filter((p)=>p.enabled)){
    try{
      const provider=createProvider(options,{budget,cache,http});
      const items=await provider.collect(config);
      collected.push(...items);
      coverage.push({provider:options.name,platform:options.platform??options.type,status:'SUCCESS',items:items.length});
    }catch(error){coverage.push({provider:options.name,platform:options.platform??options.type,status:'FAILED',items:0,error:safeError(error)});}
  }
  const {items,duplicates}=deduplicate(collected);
  const scored=items.map((item)=>scoreEvidence(item,items,config));
  const recommendations=await synthesizeRecommendations(buildRecommendations(scored,config),config,{cache,budget,fetchImpl});
  const result={schemaVersion:1,generatedAt:new Date().toISOString(),configuration:{niche:config.niche,audiences:config.audiences,geography:config.geography,researchLanguage:config.researchLanguage,contentLanguage:config.contentLanguage,keywords:config.keywords,topics:config.topics},summary:{collected:collected.length,evidenceItems:scored.length,duplicatesRemoved:duplicates.length},coverage,budget:budget.snapshot(),evidence:scored,recommendations};
  result.outputs=await writeReports(result,config.outputDirectory);
  return result;
}
function safeError(error){const message=String(error?.message??error).replace(/[A-Za-z0-9_-]{24,}/g,'[REDACTED]');return message.slice(0,300);}
