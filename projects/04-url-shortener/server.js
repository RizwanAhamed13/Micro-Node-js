import { initLogger } from 'logging-middleware';
import { createApiClient } from '../shared/apiClient.js';
import { createApp } from './app.js';

if (process.env.API_BASE_URL) {
  initLogger(createApiClient({
    baseUrl: process.env.API_BASE_URL,
    token: process.env.ACCESS_TOKEN,
    credentials: {
      email: process.env.EMAIL, name: process.env.NAME, rollNo: process.env.ROLL_NO,
      accessCode: process.env.ACCESS_CODE, clientID: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET,
    },
  }));
}

const PORT = Number(process.env.PORT) || 5000;
const app = createApp();
app.get('/health', (req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`url shortener on http://localhost:${PORT}`));
