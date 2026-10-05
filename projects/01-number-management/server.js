import { start } from '../shared/server.js';
import { createApp } from './app.js';

start(createApp(), { name: 'numbers', port: Number(process.env.PORT) || 8008 });
