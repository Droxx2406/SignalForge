export class Provider {
  constructor(options, services) { this.options = options; this.services = services; this.name = options.name; }
  async collect() { throw new Error('Provider.collect() must be implemented.'); }
  async enrich(items) { return items; }
}
