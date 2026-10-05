// #region Setup in 10 Minutes
// npm init -y && npm i express
// package.json: "type": "module", "scripts": { "dev": "node --watch 00-setup/server.js" }
import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 3000;

createApp({ log: console.log }).listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
// #endregion
