import { start, upstreamFromEnv } from '../shared/server.js';
import { createApp } from './app.js';

start(createApp({ api: upstreamFromEnv().api }), { name: 'vehicles', port: Number(process.env.PORT) || 8001 });
