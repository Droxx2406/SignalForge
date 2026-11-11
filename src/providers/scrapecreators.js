import {Provider} from './base.js';
import {extractItems, normalizeItem} from '../core/normalize.js';

const endpoints = {reddit:'/v1/reddit/search',youtube:'/v1/youtube/search',tiktok:'/v1/tiktok/search/top',instagram:'/v2/instagram/reels/search',threads:'/v1/threads/search',linkedin:'/v1/linkedin/search/posts',facebook:'/v1/google/search'};
export class ScrapeCreatorsProvider extends Provider {
  async collect(config) {
    const key = process.env.SCRAPECREATORS_API_KEY;
    if (!key) throw new Error('SCRAPECREATORS_API_KEY is required when the ScrapeCreators provider is enabled. Add it to your shell environment; do not commit it.');
    const platform = this.options.platform;
    const endpoint = endpoints[platform];
    if (!endpoint) throw new Error(`Unsupported ScrapeCreators platform: ${platform}`);
    const output = [];
    for (const keyword of config.keywords) {
      let cursor = null;
      for (let page=0; page<config.collection.maxPagesPerQuery; page++) {
        const query = platform === 'facebook' ? `site:facebook.com ${keyword} ${config.geography}` : `${keyword} ${config.geography}`;
        const url = new URL(endpoint, this.options.baseUrl ?? 'https://api.scrapecreators.com');
        url.searchParams.set('query', query); url.searchParams.set('q', query);
        if (cursor) url.searchParams.set('cursor', cursor);
        const {data:payload} = await this.services.http.json({provider:this.name,url:url.toString(),headers:{'x-api-key':key},credits:this.options.creditsPerRequest ?? 1});
        output.push(...extractItems(payload).map((raw) => normalizeItem(raw, {provider:this.name,platform,geography:config.geography,language:config.researchLanguage,topic:keyword})));
        cursor = payload?.cursor ?? payload?.nextCursor ?? null;
        if (!cursor) break;
      }
    }
    return output;
  }
}
