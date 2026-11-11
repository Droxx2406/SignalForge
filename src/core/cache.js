import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';

export class FileCache {
  constructor({directory, ttlHours = 24, enabled = true}) { this.directory = directory; this.ttlMs = ttlHours * 3600000; this.enabled = enabled; }
  key(value) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
  async get(keyData) { if (!this.enabled) return null; try { const parsed = JSON.parse(await readFile(join(this.directory, `${this.key(keyData)}.json`), 'utf8')); if (Date.now() - Date.parse(parsed.cachedAt) > this.ttlMs) return null; return parsed.value; } catch { return null; } }
  async set(keyData, value) { if (!this.enabled) return; await mkdir(this.directory, {recursive: true}); await writeFile(join(this.directory, `${this.key(keyData)}.json`), JSON.stringify({cachedAt: new Date().toISOString(), value}), {encoding: 'utf8', flag: 'w'}); }
}
