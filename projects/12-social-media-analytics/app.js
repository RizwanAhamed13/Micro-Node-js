import express from 'express';

// #region Social Media Analytics
// Keeps a snapshot of users, posts and comment counts; requests read the snapshot.
export function createAnalytics({ api, concurrency = 5 }) {
  let snapshot = { users: {}, posts: [], comments: new Map(), at: 0 };

  // #region Limit Concurrency
  // run fn over items, at most `limit` at a time (test-server calls cost money)
  async function mapLimit(items, limit, fn) {
    const out = new Array(items.length);
    let i = 0;
    const worker = async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } };
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return out;
  }
  // #endregion

  async function refresh() {
    const { users = {} } = await api('/users');
    const perUser = await mapLimit(Object.keys(users), concurrency, (id) => api(`/users/${id}/posts`));
    const posts = perUser.flatMap((r) => r.posts ?? []);
    const counts = await mapLimit(posts, concurrency, (p) => api(`/posts/${p.id}/comments`));
    const comments = new Map(posts.map((p, k) => [p.id, (counts[k].comments ?? []).length]));
    snapshot = { users, posts, comments, at: Date.now() };
  }

  function topUsers(n = 5) {
    const byUser = new Map();
    for (const p of snapshot.posts) byUser.set(String(p.userid), (byUser.get(String(p.userid)) ?? 0) + 1);
    return [...byUser]
      .sort((a, b) => b[1] - a[1] || Number(a[0]) - Number(b[0]))
      .slice(0, n)
      .map(([id, postCount]) => ({ id, name: snapshot.users[id], postCount }));
  }

  function popularPosts() {
    const max = Math.max(0, ...snapshot.comments.values());
    return snapshot.posts
      .filter((p) => snapshot.comments.get(p.id) === max)
      .map((p) => ({ ...p, commentCount: max }));
  }

  function latestPosts(n = 5) {
    return [...snapshot.posts].sort((a, b) => b.id - a.id).slice(0, n); // ids grow over time
  }

  return { refresh, topUsers, popularPosts, latestPosts, lastRefresh: () => snapshot.at };
}

export function createApp({ analytics }) {
  const app = express();
  app.get('/users', (req, res) => res.json(analytics.topUsers(5)));
  app.get('/posts', (req, res) => {
    if (req.query.type === 'popular') return res.json(analytics.popularPosts());
    if (req.query.type === 'latest') return res.json(analytics.latestPosts(5));
    res.status(400).json({ error: 'type must be popular or latest' });
  });
  return app;
}
// #endregion
