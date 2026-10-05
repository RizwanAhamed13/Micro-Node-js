// #region Bearer Token Client
// Talks to a test server that needs: POST /auth -> access_token, then Bearer on every call.
export function createApiClient({ baseUrl, credentials, token = null, timeoutMs = 3000 }) {
  let accessToken = token;

  async function auth() {
    const res = await fetch(`${baseUrl}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new Error(`auth failed: ${res.status}`);
    accessToken = (await res.json()).access_token;
    return accessToken;
  }

  async function api(path, init = {}) {
    if (!accessToken) await auth();
    const call = () =>
      fetch(`${baseUrl}${path}`, {
        ...init,
        headers: { ...init.headers, Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(timeoutMs),
      });
    let res = await call();
    if (res.status === 401) {
      await auth(); // token expired: get a new one and retry once
      res = await call();
    }
    if (!res.ok) throw new Error(`${path} -> ${res.status}`);
    return res.json();
  }

  return { auth, api };
}
// #endregion
