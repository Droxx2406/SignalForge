export class BudgetExceededError extends Error { constructor(kind, used, limit) { super(`${kind} budget exceeded (${used}/${limit}).`); this.name = 'BudgetExceededError'; this.kind = kind; } }

export class BudgetTracker {
  constructor(limits = {}) { this.limits = {requests: limits.maxRequests ?? 20, credits: limits.maxCredits ?? 20, tokens: limits.maxTokens ?? 0}; this.used = {requests: 0, credits: 0, tokens: 0}; this.events = []; }
  consume(kind, amount, meta = {}) {
    if (!Number.isFinite(amount) || amount < 0) throw new Error(`Invalid ${kind} amount.`);
    const next = this.used[kind] + amount;
    if (next > this.limits[kind]) throw new BudgetExceededError(kind, next, this.limits[kind]);
    this.used[kind] = next; this.events.push({kind, amount, at: new Date().toISOString(), ...meta});
  }
  snapshot() { return {limits: {...this.limits}, used: {...this.used}, remaining: Object.fromEntries(Object.keys(this.used).map((k) => [k, Math.max(0, this.limits[k] - this.used[k])])), events: [...this.events]}; }
}
