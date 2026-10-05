import { randomBytes } from 'node:crypto';

// #region In-Memory Store
// shortcode -> { url, createdAt, expiry, clicks: [] }
export function createLinkStore({ now = Date.now } = {}) {
  const links = new Map();

  function newCode(len = 6) {
    let code;
    do {
      code = randomBytes(12).toString('base64url').replace(/[-_]/g, '').slice(0, len);
    } while (code.length < len || links.has(code));
    return code;
  }

  // Drop expired links every minute (unref: don't keep the process alive).
  const timer = setInterval(() => {
    for (const [code, link] of links) if (Date.parse(link.expiry) < now()) links.delete(code);
  }, 60_000);
  timer.unref();

  return { links, newCode, stop: () => clearInterval(timer) };
}
// #endregion
