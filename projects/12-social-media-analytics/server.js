import { start, upstreamFromEnv } from '../shared/server.js';
import { createAnalytics, createApp } from './app.js';

// #region Background Refresh
// Refresh the snapshot in the background; requests never wait on the test server.
const analytics = createAnalytics({ api: upstreamFromEnv().api });
const refresh = () => analytics.refresh().catch((err) => console.error('refresh failed:', err.message));
await refresh(); // warm the cache before taking traffic
setInterval(refresh, Number(process.env.REFRESH_MS) || 60_000).unref();
// #endregion

start(createApp({ analytics }), { name: 'social', port: Number(process.env.PORT) || 3002 });
