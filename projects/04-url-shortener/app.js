import express from 'express';
import { Log, logRequests } from 'logging-middleware';
import { isValidUrl } from '../shared/http.js';
import { createLinkStore } from './store.js';

// #region URL Shortener Microservice
export function createApp({ now = Date.now, store = createLinkStore({ now }) } = {}) {
  const { links, newCode } = store;
  const app = express();
  app.use(express.json());
  app.use(logRequests);

  app.post('/shorturls', (req, res) => {
    const { url, validity = 30, shortcode } = req.body ?? {};
    const fail = (status, error) => {
      Log('backend', 'warn', 'handler', `POST /shorturls rejected: ${error}`);
      return res.status(status).json({ error });
    };
    if (!isValidUrl(url)) return fail(400, 'url must be a valid http(s) URL');
    if (!Number.isInteger(validity) || validity <= 0) return fail(400, 'validity must be a positive integer (minutes)');
    if (shortcode !== undefined && !/^[a-zA-Z0-9]{3,20}$/.test(shortcode)) {
      return fail(400, 'shortcode must be 3-20 letters or digits');
    }
    if (shortcode && links.has(shortcode)) return fail(409, 'shortcode already in use');

    const code = shortcode ?? newCode();
    const createdAt = new Date(now()).toISOString();
    const expiry = new Date(now() + validity * 60_000).toISOString();
    links.set(code, { url, createdAt, expiry, clicks: [] });
    Log('backend', 'info', 'handler', `created short link ${code}`);

    res.status(201).json({ shortLink: `${req.protocol}://${req.get('host')}/${code}`, expiry });
  });

  app.get('/shorturls/:code', (req, res) => {
    const link = links.get(req.params.code);
    if (!link) return res.status(404).json({ error: 'short link not found' });
    res.json({
      originalUrl: link.url,
      createdAt: link.createdAt,
      expiry: link.expiry,
      totalClicks: link.clicks.length,
      clicks: link.clicks,
    });
  });

  // #region Redirects & Headers
  app.get('/:code', (req, res) => {
    const link = links.get(req.params.code);
    if (!link) return res.status(404).json({ error: 'short link not found' });
    if (Date.parse(link.expiry) < now()) return res.status(410).json({ error: 'short link has expired' });

    link.clicks.push({
      timestamp: new Date(now()).toISOString(),
      referrer: req.get('referer') ?? 'direct',
      location: req.get('x-country') ?? 'unknown', // put a geo-IP lookup here
    });
    res.redirect(302, link.url);
  });
  // #endregion

  return app;
}
// #endregion
