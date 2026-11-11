import {FixtureProvider} from './fixture.js';
import {ScrapeCreatorsProvider} from './scrapecreators.js';
const types = {fixture:FixtureProvider,scrapecreators:ScrapeCreatorsProvider};
export function createProvider(options, services) { const Type=types[options.type]; if (!Type) throw new Error(`Unknown provider type: ${options.type}`); return new Type(options,services); }
