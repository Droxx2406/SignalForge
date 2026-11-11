import {createHash} from 'node:crypto';

const tracking = new Set(['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid','ref']);
export function canonicalizeUrl(input) { try { const url = new URL(input); url.hash = ''; for (const key of [...url.searchParams.keys()]) if (tracking.has(key.toLowerCase())) url.searchParams.delete(key); url.hostname = url.hostname.toLowerCase().replace(/^www\./, ''); url.pathname = url.pathname.replace(/\/$/, '') || '/'; [...url.searchParams.entries()].sort(([a],[b]) => a.localeCompare(b)).forEach(([k,v]) => {url.searchParams.delete(k);url.searchParams.append(k,v);}); return url.toString(); } catch { return input ?? ''; } }
const pick = (o, keys) => keys.map((k) => o?.[k]).find((v) => v !== undefined && v !== null && v !== '');
export function normalizeItem(raw, context) {
  const url = String(pick(raw, ['url','postUrl','post_url','webUrl','permalink','link']) ?? context.sourceUrl ?? '');
  const contentId = String(pick(raw, ['id','postId','post_id','videoId','video_id','shortcode','urn']) ?? createHash('sha256').update(`${context.platform}|${url}|${pick(raw,['text','title','description']) ?? ''}`).digest('hex').slice(0,20));
  const text = String(pick(raw, ['text','content','caption','description','title','body']) ?? '').trim();
  const sourceType = String(pick(raw, ['source_type','sourceType']) ?? context.sourceType ?? 'OTHER').toUpperCase();
  const canonicalUrl = canonicalizeUrl(url);
  return {
    schemaVersion: 1, id: `${context.provider}:${context.platform}:${contentId}`, provider: context.provider, platform: context.platform,
    contentId, url, canonicalUrl, observedAt: context.observedAt ?? new Date().toISOString(), publishedAt: pick(raw,['publishedAt','published_at','date','created_at','timestamp']) ?? null,
    author: {name: String(pick(raw.author ?? raw.user ?? raw, ['name','username','handle','authorName']) ?? 'Unknown'), type: sourceType},
    geography: String(pick(raw,['geography','location','country']) ?? context.geography ?? 'Unknown'), language: String(pick(raw,['language','lang']) ?? context.language ?? 'unknown'),
    text, metrics: {views: Number(pick(raw,['views','viewCount','play_count']) ?? 0), likes: Number(pick(raw,['likes','likeCount','reactions']) ?? 0), comments: Number(pick(raw,['comments','commentCount']) ?? 0), shares: Number(pick(raw,['shares','shareCount']) ?? 0)},
    topic: String(pick(raw,['topic','signal_topic']) ?? context.topic ?? ''), problem: String(pick(raw,['problem','pain']) ?? ''), workflow: String(pick(raw,['workflow','process']) ?? ''), consequence: String(pick(raw,['consequence','impact']) ?? ''),
    stance: String(pick(raw,['stance']) ?? 'CONTEXT').toUpperCase(), isVendorClaim: sourceType === 'VENDOR', tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [], rawRef: context.rawRef ?? null
  };
}
export function extractItems(payload) { if (Array.isArray(payload)) return payload; for (const key of ['items','results','posts','videos','data']) if (Array.isArray(payload?.[key])) return payload[key]; return payload && typeof payload === 'object' ? [payload] : []; }
