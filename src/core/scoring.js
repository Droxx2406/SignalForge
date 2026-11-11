const proximity = {OPERATOR:30, RESTAURANT_COMPANY:25, COMPANY_EMPLOYEE:25, CONSULTANT:20, ACCOUNTANT:20, COMMUNITY:15, CUSTOMER:15, VENDOR:10, CREATOR:5, MEDIA:5, OTHER:0};

export function scoreEvidence(item, allItems, config) {
  const sourceProximity = proximity[item.author.type] ?? 0;
  const problemSpecificity = item.workflow && item.problem && item.consequence ? 25 : item.problem && item.consequence ? 20 : item.problem ? 15 : item.text.length > 80 ? 10 : item.text ? 5 : 0;
  const relevant = [...config.keywords, ...config.topics].filter((term) => `${item.text} ${item.problem} ${item.topic}`.toLowerCase().includes(term.toLowerCase())).length;
  const commercialRelevance = Math.min(20, relevant >= 3 ? 20 : relevant === 2 ? 15 : relevant === 1 ? 10 : 5);
  const peers = allItems.filter((other) => other.id !== item.id && other.topic && other.topic === item.topic && !other.isVendorClaim && other.canonicalUrl !== item.canonicalUrl);
  const independentProviders = new Set(peers.map((peer) => peer.provider));
  const independentAuthors = new Set(peers.map((peer) => `${peer.provider}:${peer.author.name}`));
  const corroboration = independentProviders.size >= 2 ? 15 : independentAuthors.size >= 2 ? 10 : peers.length ? 5 : 0;
  const target = config.geography.toLowerCase();
  const geography = item.geography.toLowerCase();
  const geographyRelevance = geography.includes(target) || target.includes(geography) ? 10 : geography.includes('latin america') ? 6 : geography !== 'unknown' ? 4 : 0;
  const total = sourceProximity + problemSpecificity + commercialRelevance + corroboration + geographyRelevance;
  const band = total >= 80 ? 'STRONG_SIGNAL' : total >= 60 ? 'PROMISING_SIGNAL' : total >= 40 ? 'WEAK_NEEDS_VALIDATION' : 'CONTEXT_ONLY';
  return {...item, evidenceScore:{total, band, dimensions:{sourceProximity, problemSpecificity, commercialRelevance, corroboration, geographyRelevance}, rationale:'Ranks available evidence quality and relevance; it does not estimate market prevalence.'}};
}
