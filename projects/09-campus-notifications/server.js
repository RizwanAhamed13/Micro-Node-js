import { start, upstreamFromEnv } from '../shared/server.js';
import { createApp } from './app.js';

start(createApp({ api: upstreamFromEnv().api }), { name: 'notifications', port: Number(process.env.PORT) || 8002 });
