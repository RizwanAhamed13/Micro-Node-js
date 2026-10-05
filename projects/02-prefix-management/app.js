import express from 'express';
import { buildTrie, uniquePrefix } from '../shared/trie.js';

export const WORDS = [
  'bonfire', 'cardio', 'case', 'character', 'bonsai', 'java', 'python', 'cpp', 'javascript', 'swift',
  'kotlin', 'ruby', 'php', 'go', 'scala', 'rust', 'typescript', 'haskell', 'dart', 'perl',
];

// #region Prefix Management Service
export function createApp({ words = WORDS } = {}) {
  const app = express();
  const trie = buildTrie(words);
  const known = new Set(words);

  app.get('/prefixes', (req, res) => {
    const keywords = String(req.query.keywords ?? '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    res.json(
      keywords.map((keyword) =>
        known.has(keyword)
          ? { keyword, status: 'found', prefix: uniquePrefix(trie, keyword) }
          : { keyword, status: 'not_found', prefix: 'not_applicable' },
      ),
    );
  });

  return app;
}
// #endregion
