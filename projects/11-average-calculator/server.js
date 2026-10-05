import { start, upstreamFromEnv } from '../shared/server.js';
import { createApp } from './app.js';

start(createApp({ api: upstreamFromEnv().api }), { name: 'average-calculator', port: Number(process.env.PORT) || 9876 });
