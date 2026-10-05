// Generates roadmap.svg and PROJECTS.md from data.mjs.  Run: npm run roadmap
import { writeFile } from 'node:fs/promises';
import { tracks } from './data.mjs';

const W = 1440;
const CX = W / 2;
const CARD_W = 340;
const CARD_H = 50;
const ROW = 64;
const GAP_X = 56;
const PROJ_W = CARD_W * 2 + GAP_X * 2;
const PROJ_H = 64;
const BADGE_W = 520;
const BADGE_H = 64;

const PALETTES = [
  ['#3fb950', '#38bdf8', '#818cf8', '#e879f9', '#fb923c', '#fbbf24'],
  ['#22d3ee', '#2dd4bf', '#60a5fa', '#a78bfa', '#f472b6', '#facc15'],
  ['#fb923c', '#a78bfa', '#38bdf8', '#3fb950'],
];

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hm = (m) => (m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}`);
const pad = (n) => String(n).padStart(2, '0');
const secMin = (s) => s.steps.reduce((n, t) => n + t[1], 0) + s.projects.reduce((n, p) => n + p.min, 0);

// Flatten sections and number the projects per track.
const sections = [];
tracks.forEach((track, t) => {
  let pn = 0;
  track.sections.forEach((sec, k) => {
    sections.push({
      ...sec,
      t,
      label: `${['D', 'C', 'I'][t]}${k + 1}`,
      chip: `${track.short} ${k + 1}`,
      color: PALETTES[t][k % PALETTES[t].length],
      projects: sec.projects.map((p) => ({ ...p, tag: ((n) => [`PROJECT ${pad(n)}`, `PROJECT C${n}`, `PREP ${n}`][t])(++pn) })),
    });
  });
});

const nSteps = sections.reduce((n, s) => n + s.steps.length, 0);
const nProjects = sections.reduce((n, s) => n + s.projects.length, 0);
const total = nSteps + nProjects;
const totalMin = sections.reduce((n, s) => n + secMin(s), 0);

const out = [];
let y = 300;
let prevTrack = -1;

sections.forEach((sec, s) => {
  const { color } = sec;

  if (sec.t !== prevTrack) {
    const track = tracks[sec.t];
    const label = track.intro;
    out.push(
      `<g class="trackhead">` +
        `<line x1="${CX - 560}" x2="${CX - 210}" y1="${y + 22}" y2="${y + 22}"/>` +
        `<line x1="${CX + 210}" x2="${CX + 560}" y1="${y + 22}" y2="${y + 22}"/>` +
        `<text class="tname" x="${CX}" y="${y + 30}" text-anchor="middle">${esc(track.name.toUpperCase())}</text>` +
        `<text class="tsub" x="${CX}" y="${y + 56}" text-anchor="middle">${esc(label)}</text>` +
      `</g>`,
    );
    y += 110;
    prevTrack = sec.t;
  }

  const top = y;
  sec.y = top;
  const rows = Math.ceil(sec.steps.length / 2);
  const firstRow = top + BADGE_H + 74;
  const stepsEnd = firstRow + (rows - 1) * ROW + CARD_H / 2;
  const projStart = stepsEnd + 40;
  const bottom = projStart + sec.projects.length * (PROJ_H + 18) - 18;
  const next = sections[s + 1];
  const sameTrackNext = next && next.t === sec.t;
  const spineEnd = sameTrackNext ? bottom + 70 : bottom;

  out.push(`<line class="spine" x1="${CX}" y1="${top + BADGE_H}" x2="${CX}" y2="${spineEnd}" stroke="${color}"/>`);

  sec.steps.forEach(([title, min], i) => {
    const left = i % 2 === 0;
    const cy = firstRow + Math.floor(i / 2) * ROW;
    const x = left ? CX - GAP_X - CARD_W : CX + GAP_X;
    const edge = left ? x + CARD_W : x;
    out.push(`<path class="link" d="M${CX} ${cy} H${edge}" stroke="${color}"/>`);
    if (left) out.push(`<circle cx="${CX}" cy="${cy}" r="5" fill="${color}"/>`);
    out.push(
      `<g class="card" id="t-${s}-${i}" data-id="${s}-${i}" tabindex="0" role="button" aria-label="${esc(title)}">` +
        `<rect class="bg" x="${x}" y="${cy - CARD_H / 2}" width="${CARD_W}" height="${CARD_H}" rx="12"/>` +
        `<rect x="${x}" y="${cy - CARD_H / 2 + 12}" width="3" height="${CARD_H - 24}" rx="1.5" fill="${color}"/>` +
        `<g class="check"><circle class="ring" cx="${x + 28}" cy="${cy}" r="10" stroke="${color}"/>` +
        `<path class="tick" d="M${x + 23} ${cy} l3.5 3.5 l6.5 -7"/></g>` +
        `<text class="ttl" x="${x + 50}" y="${cy + 5}">${esc(title)}</text>` +
        `<text class="meta" x="${x + CARD_W - 18}" y="${cy + 4}" text-anchor="end">${min}m ›</text>` +
      `</g>`,
    );
  });

  sec.projects.forEach((p, j) => {
    const py = projStart + j * (PROJ_H + 18);
    const x = CX - PROJ_W / 2;
    const cy = py + PROJ_H / 2;
    const pillW = p.tag.length * 8 + 20;
    const n = p.endpoints ? p.endpoints.length : 0;
    const meta = n ? `${n} endpoint${n > 1 ? 's' : ''} · ${hm(p.min)} ›` : `${hm(p.min)} ›`;
    out.push(
      `<g class="card proj" id="t-${s}-p${j}" data-id="${s}-p${j}" tabindex="0" role="button" aria-label="${esc(p.title)}">` +
        `<rect class="bg" x="${x}" y="${py}" width="${PROJ_W}" height="${PROJ_H}" rx="16" stroke="${color}"/>` +
        `<g class="check"><circle class="ring" cx="${x + 32}" cy="${cy}" r="11" stroke="${color}"/>` +
        `<path class="tick" d="M${x + 26.5} ${cy} l4 4 l7 -7.5"/></g>` +
        `<rect x="${x + 58}" y="${cy - 12}" width="${pillW}" height="24" rx="12" fill="${color}" opacity=".16"/>` +
        `<text class="ptag" x="${x + 58 + pillW / 2}" y="${cy + 4}" text-anchor="middle" fill="${color}">${p.tag}</text>` +
        `<text class="pttl" x="${x + 58 + pillW + 14}" y="${cy + 6}">${esc(p.title)}</text>` +
        `<text class="meta" x="${x + PROJ_W - 22}" y="${cy + 4}" text-anchor="end">${meta}</text>` +
      `</g>`,
    );
  });

  const bx = CX - BADGE_W / 2;
  out.push(
    `<g class="badge" id="s-${s}">` +
      `<rect class="bbg" x="${bx}" y="${top}" width="${BADGE_W}" height="${BADGE_H}" rx="32" stroke="${color}"/>` +
      `<circle cx="${bx + 32}" cy="${top + 32}" r="20" fill="${color}"/>` +
      `<text class="num" x="${bx + 32}" y="${top + 37}" text-anchor="middle">${sec.label}</text>` +
      `<text class="stitle" x="${bx + 66}" y="${top + 38}">${esc(sec.title)}</text>` +
      `<text class="count" id="c-${s}" x="${bx + BADGE_W - 26}" y="${top + 37}" text-anchor="end">0/${sec.steps.length + sec.projects.length}</text>` +
    `</g>`,
    `<rect class="shipbg" x="${CX - 320}" y="${top + BADGE_H + 10}" width="640" height="26" rx="13"/>`,
    `<text class="ship" x="${CX}" y="${top + BADGE_H + 28}" text-anchor="middle"><tspan fill="${color}" font-weight="700">SHIP  </tspan>${esc(sec.ship)}  ·  ${hm(secMin(sec))}</text>`,
  );

  y = bottom + (sameTrackNext ? 70 : 100);
});

const H = y + 50;

const chipW = 70;
const navW = sections.length * (chipW + 8) - 8;
const nav = sections.map((sec, s) => {
  const x = CX - navW / 2 + s * (chipW + 8);
  return `<g class="chip" data-jump="${s}"><rect x="${x}" y="206" width="${chipW}" height="32" rx="16" stroke="${sec.color}"/>` +
    `<text x="${x + chipW / 2}" y="227" text-anchor="middle">${sec.chip}</text></g>`;
}).join('');

const header = `
<text class="h1" x="${CX}" y="92" text-anchor="middle">Node.js Microservices: Code &amp; Projects</text>
<text class="sub" x="${CX}" y="128" text-anchor="middle">${nSteps} code steps · ${nProjects} projects with full API specs · ${hm(totalMin)} · click any card · tick it when it's built</text>
<rect class="track" x="${CX - 300}" y="160" width="600" height="10" rx="5"/>
<rect id="bar" x="${CX - 300}" y="160" width="0" height="10" rx="5" fill="url(#grad)"/>
<text id="pct" class="meta" x="${CX + 316}" y="169">0 / ${total}</text>
<text id="reset" class="reset" x="${CX - 316}" y="169" text-anchor="end">reset</text>
${nav}`;

const data = JSON.stringify({
  total,
  totalMin,
  sections: sections.map((s) => ({
    title: s.title, label: s.chip, color: s.color, y: s.y, steps: s.steps, projects: s.projects,
  })),
});

const allColors = [...PALETTES[0], ...PALETTES[1]];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
<title>Node.js Microservices Roadmap</title>
<defs>
  <linearGradient id="grad" x1="0" x2="1">${allColors.map((c, i) => `<stop offset="${(i / (allColors.length - 1)).toFixed(3)}" stop-color="${c}"/>`).join('')}</linearGradient>
  <filter id="shadow" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity=".18"/></filter>
</defs>
<style><![CDATA[
  svg { --bg:#0b0f17; --card:#121826; --hover:#18213a; --border:#243047; --text:#e6edf3; --muted:#8b98ad; --track:#1c2536; --code:#0d1320; --scrim:rgba(5,8,14,.75); }
  @media (prefers-color-scheme: light) {
    svg { --bg:#f6f8fb; --card:#ffffff; --hover:#f0f4fa; --border:#dce3ed; --text:#0f172a; --muted:#5b6678; --track:#e3e8f0; --code:#f3f5f9; --scrim:rgba(15,23,42,.38); }
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
  .trackhead line { stroke: var(--border); stroke-width: 1.5; }
  .tname { fill: var(--text); font-size: 22px; font-weight: 800; letter-spacing: .14em; }
  .tsub { fill: var(--muted); font-size: 14px; }
  .spine { stroke-width: 3; opacity: .45; }
  .link { stroke-width: 2; opacity: .35; fill: none; }
  .badge .bbg { fill: var(--card); stroke-width: 2; filter: url(#shadow); }
  .badge.done .bbg { fill: var(--hover); stroke-width: 3; }
  .num { fill: #0b0f17; font-size: 15px; font-weight: 800; }
  .stitle { fill: var(--text); font-size: 19px; font-weight: 750; letter-spacing: -.01em; }
  .count { fill: var(--muted); font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .shipbg { fill: var(--card); stroke: var(--border); }
  .ship { fill: var(--muted); font-size: 13px; }
  .card { cursor: pointer; outline: none; }
  .card .bg { fill: var(--card); stroke: var(--border); stroke-width: 1; transition: fill .15s, stroke .15s; }
  .card:hover .bg, .card:focus .bg { fill: var(--hover); stroke: var(--muted); }
  .card.proj .bg { stroke-width: 1.5; filter: url(#shadow); }
  .card.proj:hover .bg, .card.proj:focus .bg { stroke-width: 2.5; }
  .ttl { fill: var(--text); font-size: 15px; font-weight: 600; }
  .pttl { fill: var(--text); font-size: 17px; font-weight: 750; }
  .ptag { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11.5px; font-weight: 800; letter-spacing: .04em; }
  .meta { fill: var(--muted); font-size: 12.5px; }
  .ring { fill: transparent; stroke-width: 2; }
  .check:hover .ring { stroke-width: 3; }
  .tick { fill: none; stroke: #0b0f17; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }
  .card.done .tick { opacity: 1; }
  .card.done .ttl, .card.done .pttl { opacity: .6; }
  #scrim { fill: var(--scrim); }
  .pbg { fill: var(--card); stroke: var(--border); filter: url(#shadow); }
  .pkick { font-size: 12px; font-weight: 700; letter-spacing: .08em; }
  .ptitle { fill: var(--text); font-size: 26px; font-weight: 800; letter-spacing: -.01em; }
  .pbrief { fill: var(--muted); font-size: 15px; }
  .phead { fill: var(--muted); font-size: 11.5px; font-weight: 800; letter-spacing: .12em; }
  .ptask { fill: var(--text); font-size: 14.5px; }
  .pdesc { fill: var(--muted); font-size: 13.5px; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; }
  .mpath { fill: var(--text); font-weight: 600; }
  .codebg { fill: var(--code); stroke: var(--border); }
  .codetx { fill: var(--text); white-space: pre; }
  .method { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; font-weight: 800; fill: #0b0f17; }
  .pbtn { cursor: pointer; }
  .pbtn text { font-size: 14px; font-weight: 700; }
  .pclose { cursor: pointer; fill: var(--muted); font-size: 22px; }
  .pclose:hover { fill: var(--text); }
  .foot { fill: var(--muted); font-size: 13px; }
]]></style>
<rect class="page" width="100%" height="100%"/>
${header}
${out.join('\n')}
<text class="foot" x="${CX}" y="${H - 24}" text-anchor="middle">Learn a step in code · build the project · tick it off · progress is saved in this browser</text>
<g id="overlay"/>
<script><![CDATA[
(() => {
  const D = ${data};
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.documentElement;
  const KEY = 'node-ms-projects-v1';
  const METHOD = { GET: '#3fb950', POST: '#38bdf8', PATCH: '#fbbf24', PUT: '#fb923c', DELETE: '#fb7185' };
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

  // Word-wrap text into lines no wider than maxW. Returns the y below the last line.
  function wrap(parent, x, y, maxW, text, cls, lh, extra) {
    let line = '';
    let node = el('text', { class: cls, x, y, ...(extra || {}) }, parent);
    for (const w of String(text).split(' ')) {
      const test = line ? line + ' ' + w : w;
      node.textContent = test;
      if (node.getComputedTextLength() > maxW && line) {
        node.textContent = line;
        y += lh;
        node = el('text', { class: cls, x, y, ...(extra || {}) }, parent, w);
        line = w;
      } else {
        line = test;
      }
    }
    return y + lh;
  }

  const idsOf = (sec, si) => [...sec.steps.map((_, i) => si + '-' + i), ...sec.projects.map((_, j) => si + '-p' + j)];
  const items = D.sections.flatMap(idsOf);
  const lookup = (id) => {
    const [si, rest] = id.split('-');
    const sec = D.sections[+si];
    if (rest[0] === 'p') return { sec, project: sec.projects[+rest.slice(1)] };
    const [title, min, tasks] = sec.steps[+rest];
    return { sec, step: { title, min, tasks } };
  };
  const minutes = (id) => { const it = lookup(id); return it.project ? it.project.min : it.step.min; };

  function render() {
    let all = 0, left = D.totalMin;
    D.sections.forEach((sec, si) => {
      const ids = idsOf(sec, si);
      let n = 0;
      ids.forEach((id) => {
        const card = document.getElementById('t-' + id);
        const on = !!done[id];
        card.classList.toggle('done', on);
        card.querySelector('.ring').style.fill = on ? sec.color : '';
        if (on) { n++; left -= minutes(id); }
      });
      all += n;
      document.getElementById('c-' + si).textContent = n + '/' + ids.length;
      document.getElementById('s-' + si).classList.toggle('done', n === ids.length);
    });
    document.getElementById('bar').setAttribute('width', (600 * all / D.total).toFixed(1));
    document.getElementById('pct').textContent = all + ' / ' + D.total + ' built · ' + Math.round(left / 60) + 'h left';
  }

  function toggle(id) {
    if (done[id]) delete done[id]; else done[id] = 1;
    save(); render();
  }

  function specText(p) {
    const L = ['# ' + p.title, '', p.brief, ''];
    const rows = (list) => list.forEach(([m, path, d]) => L.push('- ' + (m ? m + ' ' : '') + path + '  ->  ' + d));
    if (p.upstream) { L.push('## Mock upstream (build this too)'); rows(p.upstream); L.push(''); }
    if (p.endpoints) { L.push('## Your endpoints'); rows(p.endpoints); L.push(''); }
    L.push('## Requirements');
    p.rules.forEach((r) => L.push('- ' + r));
    if (p.sample) L.push('', '## Sample', '\`\`\`', p.sample, '\`\`\`');
    return L.join('\\n');
  }

  const overlay = document.getElementById('overlay');
  function close() { overlay.replaceChildren(); }

  function button(g, x, y, w, label, fill, stroke, textFill, onClick) {
    const b = el('g', { class: 'pbtn' }, g);
    el('rect', { x, y, width: w, height: 38, rx: 19, fill, stroke, 'stroke-width': 1.5 }, b);
    const t = el('text', { x: x + w / 2, y: y + 24, 'text-anchor': 'middle', fill: textFill }, b, label);
    b.addEventListener('click', (e) => { e.stopPropagation(); onClick(t); });
  }

  function heading(g, label, y, PW) {
    const t = el('text', { class: 'phead', x: 32, y }, g, label);
    el('line', { x1: 44 + t.getComputedTextLength(), x2: PW - 32, y1: y - 4, y2: y - 4, stroke: 'var(--border)' }, g);
    return y + 28;
  }

  function endpointRows(g, rows, y, PW, color) {
    rows.forEach(([m, path, d]) => {
      if (m) {
        el('rect', { x: 32, y: y - 14, width: 56, height: 20, rx: 5, fill: METHOD[m] || color }, g);
        el('text', { class: 'method', x: 60, y: y + 1, 'text-anchor': 'middle' }, g, m);
        y = wrap(g, 100, y, PW - 132, path, 'mono mpath', 19);
      } else {
        y = wrap(g, 32, y, PW - 64, path, 'ptask', 19, { 'font-weight': 700 });
      }
      y = wrap(g, m ? 100 : 32, y - 1, PW - (m ? 132 : 64), d, 'pdesc', 19) + 10;
    });
    return y;
  }

  function open(id) {
    close();
    const { sec, step, project } = lookup(id);
    const color = sec.color;
    const PW = project ? 800 : 620;

    el('rect', { id: 'scrim', width: '100%', height: '100%' }, overlay).addEventListener('click', close);
    const g = el('g', {}, overlay);
    const bg = el('rect', { class: 'pbg', x: 0, y: 0, width: PW, rx: 18 }, g);
    el('rect', { x: 24, y: 0, width: PW - 48, height: 4, rx: 2, fill: color }, g);
    const kick = (project ? project.tag + ' · ' : '') + sec.label.toUpperCase() + ' · ' + sec.title.toUpperCase() + ' · ' + minutes(id) + ' MIN';
    el('text', { class: 'pkick', x: 32, y: 44, fill: color }, g, kick);
    el('text', { class: 'pclose', x: PW - 30, y: 46, 'text-anchor': 'middle' }, g, '×').addEventListener('click', close);
    el('text', { class: 'ptitle', x: 32, y: 82 }, g, project ? project.title : step.title);
    let y;

    if (step) {
      el('line', { x1: 32, x2: PW - 32, y1: 104, y2: 104, stroke: 'var(--border)' }, g);
      y = 138;
      step.tasks.forEach((t, k) => {
        el('rect', { x: 32, y: y - 15, width: 28, height: 22, rx: 6, fill: color, opacity: .16 }, g);
        el('text', { class: 'mono', x: 46, y: y + 1, 'text-anchor': 'middle', fill: color }, g, String(k + 1).padStart(2, '0'));
        y = wrap(g, 74, y + 1, PW - 106, t, 'ptask', 20) + 18;
      });
    } else {
      y = wrap(g, 32, 116, PW - 64, project.brief, 'pbrief', 21) + 18;
      if (project.upstream) {
        y = heading(g, 'MOCK UPSTREAM · BUILD THIS TOO', y, PW);
        y = endpointRows(g, project.upstream, y, PW, color) + 12;
      }
      if (project.endpoints) {
        y = heading(g, 'YOUR ENDPOINTS', y, PW);
        y = endpointRows(g, project.endpoints, y, PW, color) + 12;
      }
      y = heading(g, 'REQUIREMENTS', y, PW);
      project.rules.forEach((r) => {
        el('circle', { cx: 38, cy: y - 5, r: 3, fill: color }, g);
        y = wrap(g, 52, y, PW - 84, r, 'ptask', 20) + 6;
      });
      if (project.sample) {
        y = heading(g, 'SAMPLE', y + 14, PW);
        const y0 = y - 22;
        const box = el('rect', { class: 'codebg', x: 32, y: y0, width: PW - 64, rx: 10 }, g);
        y += 4;
        const maxChars = Math.floor((PW - 96) / 7.85);
        project.sample.split('\\n').forEach((line) => {
          const indent = ' '.repeat(line.match(/^ */)[0].length + 2);
          let rest = line;
          do {
            el('text', { class: 'mono codetx', x: 48, y }, g, rest.slice(0, maxChars));
            rest = rest.length > maxChars ? indent + rest.slice(maxChars) : '';
            y += 19;
          } while (rest);
        });
        box.setAttribute('height', y - y0 - 4);
        y += 18;
      }
    }

    const on = !!done[id];
    y += 4;
    button(g, 32, y, 170, on ? '✓ Built · undo' : 'Mark as built',
      on ? 'transparent' : color, color, on ? color : '#0b0f17', () => { toggle(id); open(id); });
    if (project) {
      button(g, 214, y, 130, 'Copy spec', 'transparent', 'var(--border)', 'var(--text)', (t) => {
        const fail = () => { t.textContent = 'Copy failed'; };
        try {
          navigator.clipboard.writeText(specText(project)).then(() => {
            t.textContent = 'Copied ✓';
            setTimeout(() => { t.textContent = 'Copy spec'; }, 1500);
          }, fail);
        } catch (e) { fail(); }
      });
    }
    const idx = items.indexOf(id);
    if (idx > 0) button(g, PW - 232, y, 92, '‹ Prev', 'transparent', 'var(--border)', 'var(--text)', () => open(items[idx - 1]));
    if (idx < items.length - 1) button(g, PW - 124, y, 92, 'Next ›', 'transparent', 'var(--border)', 'var(--text)', () => open(items[idx + 1]));
    const PH = y + 38 + 28;
    bg.setAttribute('height', PH);

    const vb = svg.viewBox.baseVal.height;
    const card = document.getElementById('t-' + id).querySelector('.bg');
    const py = Math.max(20, Math.min(+card.getAttribute('y') - 40, vb - PH - 20));
    g.setAttribute('transform', 'translate(' + (${CX} - PW / 2) + ' ' + py + ')');

    const r = svg.getBoundingClientRect();
    const s = r.height / vb;
    const top = py * s + r.top + window.scrollY;
    const bottom = (py + PH) * s + r.top + window.scrollY;
    if (top < window.scrollY || bottom > window.scrollY + window.innerHeight) {
      window.scrollTo({ top: top - 24, behavior: 'smooth' });
    }
  }

  document.querySelectorAll('.card').forEach((c) => {
    const id = c.dataset.id;
    c.addEventListener('click', (e) => {
      if (e.target.closest('.check')) { toggle(id); return; }
      open(id);
    });
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(id); }
    });
  });

  document.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
    const r = svg.getBoundingClientRect();
    const s = r.height / svg.viewBox.baseVal.height;
    window.scrollTo({ top: D.sections[+c.dataset.jump].y * s + r.top + window.scrollY - 24, behavior: 'smooth' });
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

// PROJECTS.md: every project spec, readable on GitHub.
const md = [
  '# Projects',
  '',
  'Every project from the roadmap with its full spec. Where a project lists a mock upstream, build that small server first, then build the service against it.',
  '',
];
const cell = (s) => String(s).replace(/\|/g, '\\|');
tracks.forEach((track, t) => {
  md.push(`## ${track.name}`, '');
  sections.filter((s) => s.t === t).forEach((sec) => {
    sec.projects.forEach((p) => {
      md.push(`### ${p.tag.replace('PROJECT', 'Project')}: ${p.title}`, '', `*${sec.chip} · ${sec.title} · ${hm(p.min)}*`, '', p.brief, '');
      const table = (rows) => {
        md.push('| Method | Path | Returns |', '|---|---|---|');
        rows.forEach(([m, path, d]) => md.push(`| ${m} | \`${cell(path)}\` | ${cell(d)} |`));
        md.push('');
      };
      if (p.upstream) { md.push('**Mock upstream (build this too)**', ''); table(p.upstream); }
      if (p.endpoints) { md.push('**Your endpoints**', ''); table(p.endpoints); }
      md.push('**Requirements**', '', ...p.rules.map((r) => `- ${r}`), '');
      if (p.sample) md.push('**Sample**', '', '```', p.sample, '```', '');
    });
  });
});

await writeFile(new URL('../roadmap.svg', import.meta.url), svg);
await writeFile(new URL('../PROJECTS.md', import.meta.url), md.join('\n'));
console.log(`roadmap.svg: ${sections.length} sections, ${nSteps} steps, ${nProjects} projects, ${hm(totalMin)}, ${W}x${H}`);
