#!/usr/bin/env node
import {resolve} from 'node:path';
import {loadConfig} from './core/config.js';
import {runResearch} from './engine.js';

const [command,...args]=process.argv.slice(2);
const option=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
try{
  if(command==='run'){
    const config=await loadConfig(option('--config','config/demo.json'));
    const result=await runResearch(config);
    console.log(`SignalForge completed: ${result.summary.evidenceItems} evidence items, ${result.recommendations.length} recommendations.`);
    console.log(`JSON: ${resolve(result.outputs.jsonPath)}`); console.log(`Markdown: ${resolve(result.outputs.markdownPath)}`);
    if(result.coverage.some((c)=>c.status==='FAILED')) console.warn('Some providers failed; inspect the coverage section. Other providers continued.');
  }else if(command==='validate-config'){
    await loadConfig(option('--config','config/demo.json')); console.log('Configuration is valid.');
  }else{console.error('Usage: signalforge run --config <file> | signalforge validate-config --config <file>');process.exitCode=2;}
}catch(error){console.error(`SignalForge error: ${String(error.message??error).replace(/[A-Za-z0-9_-]{24,}/g,'[REDACTED]')}`);process.exitCode=1;}
