// Generates roadmap.svg from data.mjs.  Run: npm run roadmap
import { writeFile } from 'node:fs/promises';
import { phases } from './data.mjs';

const W = 1440;
const CX = W / 2;
const CARD_W = 340;
const CARD_H = 50;
const ROW = 64;
const GAP_X = 56;
const BADGE_W = 470;
const BADGE_H = 64;
const TOP = 300;

const COLORS = [
  '#3fb950', '#2dd4bf', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc',
  '#e879f9', '#f472b6', '#fb7185', '#fb923c', '#fbbf24', '#a3e635',
];

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');

const total = phases.reduce((n, p) => n + p.topics.length, 0);
const out = [];
const layout = [];
let y = TOP;

phases.forEach((phase, p) => {
  const color = COLORS[p % COLORS.length];
  const rows = Math.ceil(phase.topics.length / 2);
  const top = y;
  const firstRow = y + BADGE_H + 40;
  const bottom = firstRow + (rows - 1) * ROW + CARD_H / 2;
  layout.push({ y: top, color });

  // spine segment
  const last = p === phases.length - 1;
  out.push(`<line class="spine" x1="${CX}" y1="${top + BADGE_H}" x2="${CX}" y2="${last ? bottom : bottom + CARD_H / 2 + 56}" stroke="${color}"/>`);

  // topic cards
  phase.topics.forEach(([title, tasks], i) => {
    const left = i % 2 === 0;
    const row = Math.floor(i / 2);
    const cy = firstRow + row * ROW;
    const x = left ? CX - GAP_X - CARD_W : CX + GAP_X;
    const edge = left ? x + CARD_W : x;
    const id = `${p}-${i}`;
    out.push(`<path class="link" d="M${CX} ${cy} H${edge}" stroke="${color}"/>`);
    if (left) out.push(`<circle class="node" cx="${CX}" cy="${cy}" r="5" fill="${color}"/>`);
    out.push(
      `<g class="card" id="t-${id}" data-p="${p}" data-i="${i}" tabindex="0" role="button" aria-label="${esc(title)}">` +
        `<rect class="bg" x="${x}" y="${cy - CARD_H / 2}" width="${CARD_W}" height="${CARD_H}" rx="12"/>` +
        `<rect x="${x}" y="${cy - CARD_H / 2 + 12}" width="3" height="${CARD_H - 24}" rx="1.5" fill="${color}"/>` +
        `<g class="check" data-id="${id}">` +
          `<circle class="ring" cx="${x + 28}" cy="${cy}" r="10" stroke="${color}"/>` +
          `<path class="tick" d="M${x + 23} ${cy} l3.5 3.5 l6.5 -7" />` +
        `</g>` +
        `<text class="ttl" x="${x + 50}" y="${cy + 5}">${esc(title)}</text>` +
        `<text class="meta" x="${x + CARD_W - 18}" y="${cy + 4}" text-anchor="end">${tasks.length} tasks ›</text>` +
      `</g>`,
    );
  });

  // stage badge (drawn last so it sits on top of the spine)
  const bx = CX - BADGE_W / 2;
  out.push(
    `<g class="badge" id="s-${p}">` +
      `<rect class="bbg" x="${bx}" y="${top}" width="${BADGE_W}" height="${BADGE_H}" rx="32" stroke="${color}"/>` +
      `<circle cx="${bx + 32}" cy="${top + 32}" r="20" fill="${color}"/>` +
      `<text class="num" x="${bx + 32}" y="${top + 37}" text-anchor="middle">${pad(p + 1)}</text>` +
      `<text class="stitle" x="${bx + 66}" y="${top + 38}">${esc(phase.title)}</text>` +
      `<text class="count" id="c-${p}" x="${bx + BADGE_W - 26}" y="${top + 37}" text-anchor="end">0/${phase.topics.length}</text>` +
    `</g>`,
  );

  y = bottom + CARD_H / 2 + 56;
});

const H = y + 60;

// header
const navW = phases.length * 52 - 8;
const nav = phases.map((_, p) => {
  const x = CX - navW / 2 + p * 52;
  return `<g class="chip" data-jump="${p}"><rect x="${x}" y="206" width="44" height="32" rx="16" stroke="${layout[p].color}"/>` +
    `<text x="${x + 22}" y="227" text-anchor="middle">${pad(p + 1)}</text></g>`;
}).join('');

const header = `
<text class="h1" x="${CX}" y="92" text-anchor="middle">Node.js Application &amp; Microservices Roadmap</text>
<text class="sub" x="${CX}" y="128" text-anchor="middle">Code-only path · ${phases.length} stages · ${total} topics · click a topic for its build tasks · tick it when it's built</text>
<rect class="track" x="${CX - 300}" y="160" width="600" height="10" rx="5"/>
<rect id="bar" x="${CX - 300}" y="160" width="0" height="10" rx="5" fill="url(#grad)"/>
<text id="pct" class="meta" x="${CX + 316}" y="169">0 / ${total}</text>
<text id="reset" class="reset" x="${CX - 316}" y="169" text-anchor="end">reset</text>
${nav}`;

const data = JSON.stringify({
  total,
  phases: phases.map((ph, p) => ({ title: ph.title, color: layout[p].color, y: layout[p].y, topics: ph.topics })),
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
<title>Node.js Application &amp; Microservices Roadmap</title>
<defs>
  <linearGradient id="grad" x1="0" x2="1">${COLORS.map((c, i) => `<stop offset="${(i / (COLORS.length - 1)).toFixed(3)}" stop-color="${c}"/>`).join('')}</linearGradient>
  <filter id="shadow" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity=".18"/></filter>
</defs>
<style><![CDATA[
  svg { --bg:#0b0f17; --card:#121826; --hover:#18213a; --border:#243047; --text:#e6edf3; --muted:#8b98ad; --track:#1c2536; --scrim:rgba(5,8,14,.72); }
  @media (prefers-color-scheme: light) {
    svg { --bg:#f6f8fb; --card:#ffffff; --hover:#f0f4fa; --border:#dce3ed; --text:#0f172a; --muted:#5b6678; --track:#e3e8f0; --scrim:rgba(15,23,42,.35); }
  }
  .page { fill: var(--bg); }
  .h1 { fill: var(--text); font-size: 38px; font-weight: 800; letter-spacing: -.02em; }
  .sub { fill: var(--muted); font-size: 16px; }
  .track { fill: var(--track); }
  #bar { transition: width .4s ease; }
  .reset { fill: var(--muted); font-size: 13px; cursor: pointer; text-decoration: underline; }
  .reset:hover { fill: var(--text); }
  .chip { cursor: pointer; }
  .chip rect { fill: var(--card); stroke-width: 1.5; transition: fill .15s; }
  .chip text { fill: var(--text); font-size: 13px; font-weight: 700; }
  .chip:hover rect { fill: var(--hover); }
  .spine { stroke-width: 3; opacity: .45; }
  .link { stroke-width: 2; opacity: .35; fill: none; }
  .badge .bbg { fill: var(--card); stroke-width: 2; filter: url(#shadow); }
  .badge.done .bbg { fill: var(--hover); stroke-width: 3; }
  .num { fill: #0b0f17; font-size: 15px; font-weight: 800; }
  .stitle { fill: var(--text); font-size: 19px; font-weight: 750; letter-spacing: -.01em; }
  .count { fill: var(--muted); font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .card { cursor: pointer; outline: none; }
  .card .bg { fill: var(--card); stroke: var(--border); stroke-width: 1; transition: fill .15s, stroke .15s; }
  .card:hover .bg, .card:focus .bg { fill: var(--hover); stroke: var(--muted); }
  .ttl { fill: var(--text); font-size: 15px; font-weight: 600; }
  .meta { fill: var(--muted); font-size: 12.5px; }
  .ring { fill: transparent; stroke-width: 2; transition: fill .15s; }
  .check:hover .ring { stroke-width: 3; }
  .tick { fill: none; stroke: #0b0f17; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }
  .card.done .tick { opacity: 1; }
  .card.done .ttl { opacity: .6; }
  #scrim { fill: var(--scrim); }
  .pbg { fill: var(--card); stroke: var(--border); filter: url(#shadow); }
  .pkick { font-size: 12px; font-weight: 700; letter-spacing: .08em; }
  .ptitle { fill: var(--text); font-size: 26px; font-weight: 800; letter-spacing: -.01em; }
  .ptask { fill: var(--text); font-size: 15px; }
  .pmono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; }
  .pbtn { cursor: pointer; }
  .pbtn text { font-size: 14px; font-weight: 700; }
  .pclose { cursor: pointer; fill: var(--muted); font-size: 22px; }
  .pclose:hover { fill: var(--text); }
  .foot { fill: var(--muted); font-size: 13px; }
]]></style>
<rect class="page" width="100%" height="100%"/>
${header}
${out.join('\n')}
<text class="foot" x="${CX}" y="${H - 28}" text-anchor="middle">Build every box in code · progress is saved in this browser</text>
<g id="overlay"/>
<script><![CDATA[
(() => {
  const D = ${data};
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.documentElement;
  const KEY = 'node-ms-roadmap-v1';
  let done = {};
  try { done = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {} };

  const el = (tag, attrs, parent, text) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  };

  function render() {
    let all = 0;
    D.phases.forEach((ph, p) => {
      let n = 0;
      ph.topics.forEach((_, i) => {
        const id = p + '-' + i;
        const card = document.getElementById('t-' + id);
        const on = !!done[id];
        card.classList.toggle('done', on);
        card.querySelector('.ring').style.fill = on ? ph.color : '';
        if (on) n++;
      });
      all += n;
      document.getElementById('c-' + p).textContent = n + '/' + ph.topics.length;
      document.getElementById('s-' + p).classList.toggle('done', n === ph.topics.length);
    });
    document.getElementById('bar').setAttribute('width', (600 * all / D.total).toFixed(1));
    document.getElementById('pct').textContent = all + ' / ' + D.total + ' built';
  }

  function toggle(id) {
    if (done[id]) delete done[id]; else done[id] = 1;
    save(); render();
  }

  const overlay = document.getElementById('overlay');
  function close() { overlay.replaceChildren(); }

  function open(p, i) {
    close();
    const ph = D.phases[p];
    const [title, tasks] = ph.topics[i];
    const id = p + '-' + i;
    const card = document.getElementById('t-' + id).querySelector('.bg');
    const W = 600, H = 190 + tasks.length * 40;
    const x = ${CX} - W / 2;
    const vb = svg.viewBox.baseVal.height;
    const y = Math.max(20, Math.min(+card.getAttribute('y') - 40, vb - H - 20));

    el('rect', { id: 'scrim', width: '100%', height: '100%' }, overlay).addEventListener('click', close);
    const g = el('g', {}, overlay);
    el('rect', { class: 'pbg', x, y, width: W, height: H, rx: 18 }, g);
    el('rect', { x: x + 24, y, width: W - 48, height: 4, rx: 2, fill: ph.color }, g);
    el('text', { class: 'pkick', x: x + 32, y: y + 44, fill: ph.color }, g,
      'STAGE ' + String(p + 1).padStart(2, '0') + ' · ' + ph.title.toUpperCase());
    el('text', { class: 'ptitle', x: x + 32, y: y + 82 }, g, title);
    const cl = el('text', { class: 'pclose', x: x + W - 30, y: y + 46, 'text-anchor': 'middle' }, g, '×');
    cl.addEventListener('click', close);
    el('line', { x1: x + 32, x2: x + W - 32, y1: y + 104, y2: y + 104, stroke: 'var(--border)' }, g);

    tasks.forEach((t, k) => {
      const ty = y + 136 + k * 40;
      el('rect', { x: x + 32, y: ty - 15, width: 28, height: 22, rx: 6, fill: ph.color, opacity: .16 }, g);
      el('text', { class: 'pmono', x: x + 46, y: ty + 1, 'text-anchor': 'middle', fill: ph.color }, g, String(k + 1).padStart(2, '0'));
      el('text', { class: 'ptask', x: x + 74, y: ty + 1 }, g, t);
    });

    const on = !!done[id];
    const by = y + H - 58;
    const btn = el('g', { class: 'pbtn' }, g);
    el('rect', { x: x + 32, y: by, width: 180, height: 38, rx: 19,
      fill: on ? 'transparent' : ph.color, stroke: ph.color, 'stroke-width': 1.5 }, btn);
    el('text', { x: x + 122, y: by + 24, 'text-anchor': 'middle', fill: on ? ph.color : '#0b0f17' }, btn,
      on ? '✓ Built — undo' : 'Mark as built');
    btn.addEventListener('click', () => { toggle(id); open(p, i); });

    const nav = (dp, di, label, bx) => {
      const b = el('g', { class: 'pbtn' }, g);
      el('rect', { x: bx, y: by, width: 92, height: 38, rx: 19, fill: 'transparent', stroke: 'var(--border)' }, b);
      el('text', { x: bx + 46, y: by + 24, 'text-anchor': 'middle', fill: 'var(--text)' }, b, label);
      b.addEventListener('click', () => open(dp, di));
    };
    const flat = D.phases.flatMap((q, qp) => q.topics.map((_, qi) => [qp, qi]));
    const idx = flat.findIndex(([a, b]) => a === p && b === i);
    if (idx > 0) nav(...flat[idx - 1], '‹ Prev', x + W - 232);
    if (idx < flat.length - 1) nav(...flat[idx + 1], 'Next ›', x + W - 124);

    const r = svg.getBoundingClientRect();
    const s = r.height / vb;
    const top = y * s + r.top + window.scrollY;
    const bottom = (y + H) * s + r.top + window.scrollY;
    if (top < window.scrollY || bottom > window.scrollY + window.innerHeight) {
      window.scrollTo({ top: top - 24, behavior: 'smooth' });
    }
  }

  document.querySelectorAll('.card').forEach((c) => {
    const p = +c.dataset.p, i = +c.dataset.i;
    c.addEventListener('click', (e) => {
      if (e.target.closest('.check')) { toggle(p + '-' + i); return; }
      open(p, i);
    });
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(p, i); }
    });
  });

  document.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
    const r = svg.getBoundingClientRect();
    const s = r.height / svg.viewBox.baseVal.height;
    window.scrollTo({ top: D.phases[+c.dataset.jump].y * s + r.top + window.scrollY - 24, behavior: 'smooth' });
  }));

  document.getElementById('reset').addEventListener('click', () => {
    if (confirm('Reset all progress?')) { done = {}; save(); render(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  render();
})();
]]></script>
</svg>
`;

await writeFile(new URL('../roadmap.svg', import.meta.url), svg);
console.log(`roadmap.svg: ${phases.length} stages, ${total} topics, ${W}x${H}`);
