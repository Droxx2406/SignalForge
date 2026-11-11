import {readFile} from 'node:fs/promises';
import {Provider} from './base.js';
import {normalizeItem} from '../core/normalize.js';

export class FixtureProvider extends Provider {
  async collect(config) {
    const payload = JSON.parse(await readFile(this.options.fixturePath, 'utf8'));
    return payload.map((raw) => normalizeItem(raw, {provider:this.name, platform:raw.platform ?? 'fixture', geography:raw.geography ?? config.geography, language:raw.language ?? config.researchLanguage, topic:raw.topic}));
  }
}
