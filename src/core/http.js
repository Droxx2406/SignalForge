const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class HttpClient {
  constructor({budget, cache, timeoutMs = 15000, maxRetries = 2, baseDelayMs = 300, minIntervalMs = 0, fetchImpl = fetch}) { Object.assign(this, {budget, cache, timeoutMs, maxRetries, baseDelayMs, minIntervalMs, fetchImpl}); this.lastRequestAt = 0; }
  async json({provider, url, headers = {}, credits = 1}) {
    const cacheKey = {provider, url}; const cached = await this.cache.get(cacheKey); if (cached) return {data: cached, cached: true, attempts: 0};
    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const wait = Math.max(0, this.minIntervalMs - (Date.now() - this.lastRequestAt)); if (wait) await sleep(wait);
      this.budget.consume('requests', 1, {provider}); this.budget.consume('credits', credits, {provider});
      const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        this.lastRequestAt = Date.now(); const response = await this.fetchImpl(url, {headers, signal: controller.signal});
        if (response.status === 429 || response.status >= 500) { const error = new Error(`HTTP ${response.status}`); error.retryable = true; throw error; }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json(); await this.cache.set(cacheKey, data); return {data, cached: false, attempts: attempt + 1};
      } catch (error) { lastError = error; if (attempt >= this.maxRetries || (!error.retryable && error.name !== 'AbortError')) break; await sleep(this.baseDelayMs * (2 ** attempt)); }
      finally { clearTimeout(timer); }
    }
    throw new Error(`Request failed after bounded retries: ${lastError?.message ?? 'unknown error'}`);
  }
}
