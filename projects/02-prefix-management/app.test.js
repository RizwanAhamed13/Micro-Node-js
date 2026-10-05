import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { buildTrie, uniquePrefix } from '../shared/trie.js';

describe('02 prefix management service', () => {
  const app = createApp();

  it('test case 1 from the problem statement', async () => {
    const res = await request(app).get('/prefixes?keywords=bonfire,bonsai');
    expect(res.body).toEqual([
      { keyword: 'bonfire', status: 'found', prefix: 'bonf' },
      { keyword: 'bonsai', status: 'found', prefix: 'bons' },
    ]);
  });

  it('unknown keywords are not_found / not_applicable', async () => {
    const res = await request(app).get('/prefixes?keywords=bonfire,bool');
    expect(res.body).toEqual([
      { keyword: 'bonfire', status: 'found', prefix: 'bonf' },
      { keyword: 'bool', status: 'not_found', prefix: 'not_applicable' },
    ]);
  });

  it('shares prefixes correctly across similar words', async () => {
    const res = await request(app).get('/prefixes?keywords=case,character,cardio');
    expect(res.body.map((r) => r.prefix)).toEqual(['cas', 'ch', 'car']);
  });

  it('a word that is a prefix of another returns the whole word', () => {
    const trie = buildTrie(['java', 'javascript']);
    expect(uniquePrefix(trie, 'java')).toBe('java');
    expect(uniquePrefix(trie, 'javascript')).toBe('javas');
  });

  it('handles empty keywords', async () => {
    expect((await request(app).get('/prefixes')).body).toEqual([]);
  });
});
