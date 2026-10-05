// Generates the interactive web roadmap from data.mjs + content.md.
//   docs/index.html  -> GitHub Pages
// Run: npm run roadmap
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { tracks } from './data.mjs';

const root = new URL('../', import.meta.url);

// ---------- content.md -> { title: { what, lang, code } } ----------
const raw = await readFile(new URL('roadmap/content.md', root), 'utf8');
const content = {};
for (const block of raw.split(/^## /m).slice(1)) {
  const title = block.slice(0, block.indexOf('\n')).trim();
  const what = block.match(/^what:\s*(.+)$/m)?.[1].trim();
  const lang = block.match(/^lang:\s*(\w+)$/m)?.[1] ?? 'js';
  const code = block.match(/```\n([\s\S]*?)\n```/)?.[1];
  content[title] = { what, lang, code };
}

// ---------- tiny build-time syntax highlighter ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STR = String.raw`'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|` + '`(?:\\\\.|[^`\\\\])*`';
const RULES = {
  js: [
    ['c', String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`],
    ['s', STR],
    ['k', String.raw`\b(?:const|let|var|function|return|if|else|for|of|in|while|do|await|async|new|class|import|from|export|default|try|catch|throw|break|continue|typeof|this|get)\b`],
    ['n', String.raw`\b(?:true|false|null|undefined|Infinity)\b|\b\d[\d_]*(?:\.\d+)?(?:e\d+)?\b`],
    ['f', String.raw`\b[A-Za-z_$][\w$]*(?=\()`],
  ],
  prisma: [
    ['c', String.raw`\/\/[^\n]*`],
    ['s', STR],
    ['k', String.raw`\b(?:model|datasource|generator|env)\b`],
    ['t', String.raw`\b(?:Int|String|DateTime|Boolean|Float)\b(?:\[\])?`],
    ['f', String.raw`@\w+(?:\.\w+)?`],
  ],
  json: [
    ['p', String.raw`"(?:\\.|[^"\\\n])*"(?=\s*:)`],
    ['s', String.raw`"(?:\\.|[^"\\\n])*"`],
    ['n', String.raw`\b(?:true|false|null)\b|-?\b\d+(?:\.\d+)?\b`],
  ],
  sh: [
    ['c', String.raw`(?:^|(?<=\s))#[^\n]*`],
    ['s', String.raw`'[^'\n]*'|"(?:\\.|[^"\\\n])*"`],
    ['k', String.raw`(?:^|(?<=[\s;&|(]))(?:docker|npm|npx|git|curl|cd|mkdir|cp|printf|echo|ssh|export|go)\b`],
    ['p', String.raw`\s--?[\w-]+`],
    ['n', String.raw`\$\(?[\w{}]+\)?`],
  ],
  yaml: [
    ['c', String.raw`(?:^|(?<=\s))#[^\n]*`],
    ['p', String.raw`[\w.-]+(?=:(?:\s|$))`],
    ['s', String.raw`'[^'\n]*'|"(?:\\.|[^"\\\n])*"`],
    ['n', String.raw`\b(?:true|false)\b|\b\d+(?::\d+)?\b`],
  ],
  docker: [
    ['c', String.raw`^#[^\n]*`],
    ['k', String.raw`^(?:FROM|WORKDIR|COPY|RUN|ENV|EXPOSE|CMD|USER|HEALTHCHECK|ARG|ENTRYPOINT)\b|\bAS\b`],
    ['s', String.raw`"(?:\\.|[^"\\\n])*"`],
    ['p', String.raw`--[\w-]+(?:=\S+)?`],
  ],
  text: [
    ['n', String.raw`^[\d:-]+(?=\s)`],
  ],
};
function highlight(code, lang) {
  const rules = RULES[lang] ?? RULES.text;
  const re = new RegExp(rules.map(([name, src]) => `(?<${name}>${src})`).join('|'), 'gm');
  let out = '';
  let last = 0;
  for (const m of code.matchAll(re)) {
    if (m[0] === '') { re.lastIndex++; continue; }
    out += esc(code.slice(last, m.index));
    const kind = Object.entries(m.groups).find(([, v]) => v !== undefined)[0];
    out += `<span class="t-${kind}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(code.slice(last));
}

// ---------- flatten the roadmap ----------
const COLORS = [
  ['#2f9e5b', '#1f8fc4', '#6d63d9', '#c04fc0', '#d9702a', '#c99312'],
  ['#119bb5', '#1a9d86', '#3f78d6', '#8a5cd6', '#d44f8e', '#b8930c'],
];
const pad = (n) => String(n).padStart(2, '0');
const hm = (m) => (m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}`);

const missing = [];
const days = [];
tracks.forEach((track, t) => {
  let pn = 0;
  track.sections.forEach((sec, k) => {
    const id = `${t === 0 ? 'd' : 'b'}${k + 1}`;
    const items = [
      ...sec.steps.map(([title, min, tasks], i) => ({ kind: 'step', id: `${id}-s${i}`, title, min, tasks })),
      ...sec.projects.map((p, j) => ({ kind: 'project', id: `${id}-p${j}`, ...p, tag: t === 0 ? `Project ${pad(++pn)}` : `Project C${++pn}` })),
    ];
    for (const it of items) {
      const c = content[it.title];
      if (!c?.what || !c?.code) missing.push(it.title);
      else Object.assign(it, { what: c.what, lang: c.lang, code: c.code, html: highlight(c.code, c.lang) });
    }
    days.push({
      id, t, track: track.name, label: `${track.short} ${k + 1}`, badge: `${t === 0 ? 'D' : 'C'}${k + 1}`,
      title: sec.title, ship: sec.ship, color: COLORS[t][k % 6], items,
      min: items.reduce((s, i) => s + i.min, 0),
    });
  });
});
if (missing.length) throw new Error(`content.md is missing: ${missing.join(', ')}`);

const all = days.flatMap((d) => d.items);
const totalMin = all.reduce((s, i) => s + i.min, 0);
const nProjects = all.filter((i) => i.kind === 'project').length;

// ---------- markup ----------
const card = (it, d) => it.kind === 'step' ? `
      <div class="card step" data-id="${it.id}">
        <button class="tick" type="button" aria-label="Mark ${esc(it.title)} as built"></button>
        <button class="open" type="button">
          <span class="c-title">${esc(it.title)}</span>
          <span class="c-what">${esc(it.what)}</span>
          <span class="c-meta">${it.min} min · ${it.tasks.length} tasks</span>
        </button>
      </div>` : `
      <div class="card project" data-id="${it.id}">
        <button class="tick" type="button" aria-label="Mark ${esc(it.title)} as built"></button>
        <button class="open" type="button">
          <span class="c-tag">${it.tag}</span>
          <span class="c-title">${esc(it.title)}</span>
          <span class="c-what">${esc(it.what)}</span>
          <span class="c-meta">${it.endpoints ? `${it.endpoints.length} endpoint${it.endpoints.length > 1 ? 's' : ''} · ` : ''}${hm(it.min)}</span>
        </button>
      </div>`;

const dayBlock = (d) => `
    <section class="day" id="${d.id}" style="--c: ${d.color}">
      <div class="node" aria-hidden="true">${d.badge}</div>
      <header class="day-head">
        <p class="eyebrow">${d.label} · ${hm(d.min)}</p>
        <h3>${esc(d.title)}</h3>
        <p class="ship"><b>Ship</b> ${esc(d.ship)}</p>
        <p class="count" data-count="${d.id}">0 / ${d.items.length}</p>
      </header>
      <div class="steps">${d.items.filter((i) => i.kind === 'step').map((i) => card(i, d)).join('')}
      </div>
      <div class="projects">${d.items.filter((i) => i.kind === 'project').map((i) => card(i, d)).join('')}
      </div>
    </section>`;

const trackBlock = (t) => {
  const ds = days.filter((d) => d.t === t);
  const sub = t === 0
    ? 'Six days. Learn a step in code, then build real assessment questions.'
    : 'An easy extra track that puts the projects you built into containers.';
  return `
  <section class="track" aria-labelledby="track-${t}">
    <div class="track-head">
      <h2 id="track-${t}">${esc(tracks[t].name)}</h2>
      <p>${sub}</p>
    </div>
    <div class="timeline">${ds.map(dayBlock).join('')}
    </div>
  </section>`;
};

const DATA = JSON.stringify({
  totalMin,
  days: days.map((d) => ({ id: d.id, label: d.label, title: d.title, color: d.color, items: d.items.map((i) => i.id) })),
  items: Object.fromEntries(all.map((i) => [i.id, {
    kind: i.kind, title: i.title, min: i.min, what: i.what, lang: i.lang, code: i.code, html: i.html,
    tasks: i.tasks, tag: i.tag, brief: i.brief, upstream: i.upstream, endpoints: i.endpoints, rules: i.rules, sample: i.sample,
  }])),
}).replace(/</g, '\\u003c');

const body = `<title>Node Microservices Roadmap</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
/* Layout: one vertical timeline per track; days hang off the line, steps in a grid, projects full width. A drawer holds the detail. */
:root {
  --bg: #f4f6f2; --surface: #ffffff; --surface-2: #eaeee8; --fg: #17201b; --muted: #5a6760;
  --line: #d6ddd5; --accent: #2a8a55; --accent-ink: #ffffff; --shadow: 0 1px 2px rgb(20 30 25 / .06), 0 8px 24px rgb(20 30 25 / .07);
  --code-bg: #111915; --code-fg: #dbe5de; --code-line: #23302a;
  --t-c: #73867b; --t-s: #9ad48c; --t-k: #f0a35e; --t-n: #e6c76b; --t-f: #7cc6f2; --t-p: #c9a6f5; --t-t: #6fd6c4;
  --display: "Bricolage Grotesque", "Avenir Next", "Segoe UI", sans-serif;
  --body: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  --r: 12px;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0d1210; --surface: #141b18; --surface-2: #1b2420; --fg: #e3ebe6; --muted: #93a29a;
    --line: #26312c; --accent: #57c487; --accent-ink: #08130d; --shadow: 0 1px 2px rgb(0 0 0 / .4), 0 10px 30px rgb(0 0 0 / .35);
    --code-bg: #0a0f0d; --code-fg: #dbe5de; --code-line: #1f2a25; color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #0d1210; --surface: #141b18; --surface-2: #1b2420; --fg: #e3ebe6; --muted: #93a29a;
  --line: #26312c; --accent: #57c487; --accent-ink: #08130d; --shadow: 0 1px 2px rgb(0 0 0 / .4), 0 10px 30px rgb(0 0 0 / .35);
  --code-bg: #0a0f0d; --code-fg: #dbe5de; --code-line: #1f2a25; color-scheme: dark;
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.55 var(--body); -webkit-font-smoothing: antialiased; }
.wrap { max-width: 1120px; margin: 0 auto; padding-inline: max(16px, 3vw); }
button { font: inherit; color: inherit; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* header */
.top { padding-block: 48px 20px; }
.kicker { font: 600 12px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--accent); margin: 0 0 14px; }
h1 { font: 800 clamp(34px, 5.4vw, 60px)/1.02 var(--display); letter-spacing: -.025em; margin: 0; text-wrap: balance; max-width: 16ch; }
.lede { color: var(--muted); max-width: 60ch; margin: 16px 0 0; font-size: 16px; }
.stats { display: flex; flex-wrap: wrap; gap: 8px 22px; margin: 22px 0 0; padding: 0; list-style: none; font: 500 13px var(--mono); color: var(--muted); }
.stats b { color: var(--fg); font-weight: 600; }

.controls { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: color-mix(in oklab, var(--bg) 88%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
.controls .wrap { display: grid; gap: 10px; padding-block: 12px; }
.row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.progress { flex: 1 1 260px; display: flex; align-items: center; gap: 12px; min-width: 0; }
.bar { flex: 1; height: 8px; border-radius: 99px; background: var(--surface-2); overflow: hidden; }
.bar i { display: block; height: 100%; width: 0; background: var(--accent); border-radius: inherit; transition: width .4s ease; }
.pct { font: 500 13px var(--mono); color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.search { flex: 0 1 240px; min-width: 0; height: 36px; padding: 0 12px; border: 1px solid var(--line); border-radius: 9px; background: var(--surface); color: var(--fg); font: 14px var(--body); }
.seg { display: inline-flex; border: 1px solid var(--line); border-radius: 9px; overflow: hidden; background: var(--surface); }
.seg button { border: 0; background: none; padding: 7px 12px; font-size: 13px; cursor: pointer; color: var(--muted); }
.seg button[aria-pressed="true"] { background: var(--fg); color: var(--bg); }
.reset { border: 0; background: none; color: var(--muted); font-size: 13px; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.reset.confirm { color: #c2410c; }
.chips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.chips::-webkit-scrollbar { display: none; }
.chips a { flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 99px; border: 1px solid var(--line); background: var(--surface); color: var(--fg); text-decoration: none; font: 600 12.5px var(--mono); }
.chips a::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
.chips a.done { background: color-mix(in oklab, var(--c) 18%, var(--surface)); }
.chips .sep { flex: none; width: 1px; background: var(--line); margin: 4px 4px; }

/* tracks + timeline */
main { padding-block: 24px 80px; }
.track + .track { margin-top: 72px; }
.track-head { display: grid; gap: 4px; margin-bottom: 28px; }
.track-head h2 { font: 800 clamp(24px, 3vw, 32px)/1.1 var(--display); margin: 0; letter-spacing: -.015em; }
.track-head p { margin: 0; color: var(--muted); }
.timeline { position: relative; display: grid; gap: 44px; padding-left: 56px; }
.timeline::before { content: ""; position: absolute; left: 19px; top: 8px; bottom: 8px; width: 2px; background: var(--line); }
.day { position: relative; display: grid; gap: 14px; }
.day[hidden-by-filter] { display: none; }
.node { position: absolute; left: -56px; top: 0; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font: 800 13px var(--mono); background: var(--c); color: #fff; box-shadow: 0 0 0 5px var(--bg); }
.day.complete .node { box-shadow: 0 0 0 5px var(--bg), 0 0 0 7px var(--c); }
.day-head { display: grid; grid-template-columns: 1fr auto; gap: 2px 16px; align-items: end; }
.eyebrow { grid-column: 1; margin: 0; font: 600 12px var(--mono); letter-spacing: .08em; text-transform: uppercase; color: color-mix(in oklab, var(--c) 75%, var(--fg)); }
.day-head h3 { grid-column: 1; margin: 0; font: 700 22px/1.2 var(--display); letter-spacing: -.01em; }
.ship { grid-column: 1; margin: 4px 0 0; color: var(--muted); font-size: 14px; }
.ship b { font: 700 11px var(--mono); letter-spacing: .1em; text-transform: uppercase; color: color-mix(in oklab, var(--c) 75%, var(--fg)); margin-right: 6px; }
.count { grid-column: 2; grid-row: 1 / span 3; margin: 0; font: 600 14px var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; align-self: start; }

.steps { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr)); gap: 10px; }
.projects { display: grid; gap: 10px; }
.projects:empty { display: none; }

.card { position: relative; display: flex; min-width: 0; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r); transition: border-color .15s, transform .15s; }
.card:hover { border-color: color-mix(in oklab, var(--c) 55%, var(--line)); }
.card .open { flex: 1; min-width: 0; display: grid; gap: 3px; text-align: left; background: none; border: 0; padding: 13px 14px 13px 0; cursor: pointer; }
.card .tick { flex: none; width: 46px; display: grid; place-items: center; background: none; border: 0; cursor: pointer; padding: 0; }
.card .tick::before { content: ""; width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--c); transition: background .15s; }
.card .tick:hover::before { background: color-mix(in oklab, var(--c) 25%, transparent); }
.card.done .tick::before { background: var(--c) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M5 10.5l3.2 3.2L15 7' fill='none' stroke='white' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/100% no-repeat; }
.card.done .c-title { color: var(--muted); }
.c-title { font-weight: 600; font-size: 15px; }
.c-what { color: var(--muted); font-size: 13.5px; line-height: 1.45; }
.c-meta { font: 500 12px var(--mono); color: var(--muted); margin-top: 4px; }
.card.project { border-width: 1.5px; border-color: color-mix(in oklab, var(--c) 45%, var(--line)); box-shadow: var(--shadow); }
.card.project .open { padding-block: 16px; grid-template-columns: 1fr auto; column-gap: 16px; }
.card.project .c-tag { grid-column: 1 / -1; font: 700 11px var(--mono); letter-spacing: .1em; text-transform: uppercase; color: color-mix(in oklab, var(--c) 75%, var(--fg)); }
.card.project .c-title { font: 700 18px/1.25 var(--display); }
.card.project .c-what { grid-column: 1; }
.card.project .c-meta { grid-column: 2; grid-row: 2 / span 2; align-self: center; margin: 0; white-space: nowrap; }
.card[hidden-by-filter] { display: none; }
.empty { display: none; color: var(--muted); padding: 40px 0; }
.empty.show { display: block; }

/* drawer */
dialog { border: 0; padding: 0; margin: 0 0 0 auto; height: 100%; max-height: 100%; max-width: 100%; width: min(760px, 100%); background: var(--surface); color: var(--fg); box-shadow: var(--shadow); }
dialog::backdrop { background: rgb(8 12 10 / .45); }
dialog[open] { animation: slide .22s ease-out; }
@keyframes slide { from { transform: translateX(24px); opacity: .4; } }
@media (prefers-reduced-motion: reduce) { dialog[open] { animation: none; } .bar i { transition: none; } }
.sheet { display: flex; flex-direction: column; height: 100%; }
.sheet-head { padding: 22px 24px 16px; border-bottom: 1px solid var(--line); display: grid; gap: 6px; padding-top: calc(22px + env(safe-area-inset-top, 0px)); }
.sheet-top { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.sheet-kick { font: 600 12px var(--mono); letter-spacing: .08em; text-transform: uppercase; color: color-mix(in oklab, var(--c) 75%, var(--fg)); }
.x { border: 0; background: var(--surface-2); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 18px; line-height: 1; }
.sheet h2 { margin: 0; font: 800 clamp(24px, 4vw, 30px)/1.12 var(--display); letter-spacing: -.015em; text-wrap: balance; }
.what { display: flex; gap: 10px; align-items: baseline; margin: 6px 0 0; font-size: 15.5px; }
.what b { flex: none; font: 700 10.5px var(--mono); letter-spacing: .12em; text-transform: uppercase; padding: 3px 7px; border-radius: 5px; background: color-mix(in oklab, var(--c) 18%, transparent); color: color-mix(in oklab, var(--c) 75%, var(--fg)); }
.sheet-body { flex: 1; overflow-y: auto; padding: 20px 24px 28px; display: grid; gap: 24px; align-content: start; }
.sheet-body > * { min-width: 0; }
.sheet-body h4 { margin: 0 0 10px; font: 700 11.5px var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
.brief { margin: 0; color: var(--muted); font-size: 15px; max-width: 65ch; }
.tasks { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.tasks label { display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; border-radius: 9px; background: var(--surface-2); cursor: pointer; }
.tasks input { accent-color: var(--c); margin-top: 3px; flex: none; }
.tasks span { font: 13.5px/1.5 var(--mono); min-width: 0; overflow-wrap: anywhere; }
.tasks input:checked + span { color: var(--muted); text-decoration: line-through; }
.rules { margin: 0; padding-left: 18px; display: grid; gap: 6px; }
.rules li::marker { color: var(--c); }
.eps { display: grid; gap: 8px; }
.ep { display: grid; grid-template-columns: 64px 1fr; gap: 2px 12px; align-items: baseline; }
.m { font: 700 11px var(--mono); text-align: center; padding: 3px 0; border-radius: 5px; color: #fff; background: var(--muted); }
.m.GET { background: #2f8a55; } .m.POST { background: #2470b3; } .m.PATCH { background: #a3700a; } .m.PUT { background: #b45a1c; } .m.DELETE { background: #b83a4b; }
.ep code { font: 600 13px var(--mono); overflow-wrap: anywhere; min-width: 0; }
.ep .d { grid-column: 2; color: var(--muted); font-size: 13.5px; overflow-wrap: anywhere; }
.ep.label code { grid-column: 1 / -1; font-family: var(--body); }
.ep.label .d { grid-column: 1 / -1; }
.code { border-radius: 10px; background: var(--code-bg); border: 1px solid var(--code-line); overflow: hidden; }
.code-bar { display: flex; justify-content: space-between; align-items: center; padding: 6px 8px 6px 14px; border-bottom: 1px solid var(--code-line); font: 600 11px var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--t-c); }
.copy { border: 1px solid var(--code-line); background: transparent; color: var(--code-fg); font: 600 12px var(--mono); padding: 4px 10px; border-radius: 6px; cursor: pointer; }
.copy:hover { background: var(--code-line); }
pre { margin: 0; padding: 14px; overflow-x: auto; font: 13px/1.6 var(--mono); color: var(--code-fg); tab-size: 2; }
.t-c { color: var(--t-c); font-style: italic; } .t-s { color: var(--t-s); } .t-k { color: var(--t-k); } .t-n { color: var(--t-n); }
.t-f { color: var(--t-f); } .t-p { color: var(--t-p); } .t-t { color: var(--t-t); }
.sheet-foot { border-top: 1px solid var(--line); padding: 14px 24px; padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px)); display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.btn { border: 1px solid var(--line); background: var(--surface); padding: 9px 16px; border-radius: 99px; font-weight: 600; font-size: 14px; cursor: pointer; }
.btn.primary { background: var(--c); border-color: var(--c); color: #fff; }
.btn.primary.is-done { background: transparent; color: color-mix(in oklab, var(--c) 75%, var(--fg)); }
.spacer { flex: 1; }
.foot { color: var(--muted); font-size: 13px; padding-block: 0 48px; }

@media (max-width: 640px) {
  .timeline { padding-left: 0; }
  .timeline::before, .node { display: none; }
  .day-head .eyebrow::before { content: ""; display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--c); margin-right: 8px; }
  .card.project .open { grid-template-columns: 1fr; }
  .card.project .c-meta { grid-column: 1; grid-row: auto; margin-top: 4px; }
  dialog { width: 100%; }
  .search { flex: 1 1 100%; }
  .sheet-head, .sheet-body, .sheet-foot { padding-inline: 16px; }
  .spacer { display: none; }
  .sheet-foot .btn { padding: 8px 13px; }
}
</style>

<header class="top wrap">
  <p class="kicker">Code-only roadmap</p>
  <h1>Node microservices, step by step</h1>
  <p class="lede">Every card is one small thing to code. Open it for a one-line explanation, the tasks and a working snippet. Projects are real backend assessment questions with their full API spec.</p>
  <ul class="stats">
    <li><b>${all.length - nProjects}</b> steps</li>
    <li><b>${nProjects}</b> projects</li>
    <li><b>${hm(totalMin)}</b> of building</li>
    <li><b>2</b> tracks</li>
  </ul>
</header>

<div class="controls">
  <div class="wrap">
    <div class="row">
      <div class="progress"><div class="bar"><i id="bar"></i></div><span class="pct" id="pct">0 / ${all.length} built</span></div>
      <input class="search" id="search" type="search" placeholder="Search cards" aria-label="Search cards">
      <div class="seg" role="group" aria-label="Show">
        <button type="button" data-filter="all" aria-pressed="true">All</button>
        <button type="button" data-filter="todo" aria-pressed="false">To do</button>
        <button type="button" data-filter="done" aria-pressed="false">Built</button>
      </div>
      <button class="reset" id="reset" type="button">Reset</button>
    </div>
    <nav class="chips" aria-label="Jump to">${days.map((d, i) => `${i > 0 && days[i - 1].t !== d.t ? '<span class="sep"></span>' : ''}<a href="#${d.id}" style="--c: ${d.color}" data-chip="${d.id}">${d.label}</a>`).join('')}</nav>
  </div>
</div>

<main class="wrap">${[0, 1].map(trackBlock).join('')}
  <p class="empty" id="empty">No cards match. Clear the search or the filter.</p>
</main>
<footer class="foot wrap">Progress is saved in this browser. Press ← and → in a card to move along the path, Esc to close.</footer>

<dialog id="sheet" aria-labelledby="sheet-title">
  <div class="sheet">
    <div class="sheet-head">
      <div class="sheet-top"><span class="sheet-kick" id="sheet-kick"></span><button class="x" id="close" type="button" aria-label="Close">×</button></div>
      <h2 id="sheet-title"></h2>
      <p class="what"><b>What</b><span id="sheet-what"></span></p>
    </div>
    <div class="sheet-body" id="sheet-body"></div>
    <div class="sheet-foot">
      <button class="btn primary" id="built" type="button"></button>
      <button class="btn" id="copyspec" type="button">Copy spec</button>
      <span class="spacer"></span>
      <button class="btn" id="prev" type="button">‹ Prev</button>
      <button class="btn" id="next" type="button">Next ›</button>
    </div>
  </div>
</dialog>

<script>
(() => {
  const D = ${DATA};
  const order = D.days.flatMap((d) => d.items);
  const dayOf = {};
  D.days.forEach((d) => d.items.forEach((id) => { dayOf[id] = d; }));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  let built = store.get('nmr-built', {});
  let ticks = store.get('nmr-ticks', {});
  let filter = 'all';

  // ----- progress -----
  function render() {
    let n = 0, left = D.totalMin;
    for (const id of order) {
      const on = !!built[id];
      $('[data-id="' + id + '"]').classList.toggle('done', on);
      if (on) { n++; left -= D.items[id].min; }
    }
    for (const d of D.days) {
      const k = d.items.filter((id) => built[id]).length;
      $('[data-count="' + d.id + '"]').textContent = k + ' / ' + d.items.length;
      $('#' + d.id).classList.toggle('complete', k === d.items.length);
      $('[data-chip="' + d.id + '"]').classList.toggle('done', k === d.items.length);
    }
    $('#bar').style.width = (100 * n / order.length).toFixed(1) + '%';
    $('#pct').textContent = n + ' / ' + order.length + ' built · ' + Math.round(left / 60) + 'h left';
    applyFilter();
  }
  function toggle(id) {
    if (built[id]) delete built[id]; else built[id] = 1;
    store.set('nmr-built', built);
    render();
  }

  // ----- search + filter -----
  function applyFilter() {
    const q = $('#search').value.trim().toLowerCase();
    let shown = 0;
    for (const d of D.days) {
      let any = false;
      for (const id of d.items) {
        const it = D.items[id];
        const hit = (!q || (it.title + ' ' + it.what).toLowerCase().includes(q)) &&
          (filter === 'all' || (filter === 'done') === !!built[id]);
        $('[data-id="' + id + '"]').toggleAttribute('hidden-by-filter', !hit);
        any ||= hit;
        if (hit) shown++;
      }
      $('#' + d.id).toggleAttribute('hidden-by-filter', !any);
    }
    $('#empty').classList.toggle('show', shown === 0);
  }
  $('#search').addEventListener('input', applyFilter);
  $$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.filter;
    $$('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    applyFilter();
  }));
  const reset = $('#reset');
  reset.addEventListener('click', () => {
    if (!reset.classList.contains('confirm')) {
      reset.classList.add('confirm'); reset.textContent = 'Click again to reset';
      setTimeout(() => { reset.classList.remove('confirm'); reset.textContent = 'Reset'; }, 3000);
      return;
    }
    built = {}; ticks = {}; store.set('nmr-built', built); store.set('nmr-ticks', ticks);
    reset.classList.remove('confirm'); reset.textContent = 'Reset';
    render();
  });

  // ----- drawer -----
  const sheet = $('#sheet');
  let current = null;

  function codeBlock(label, text, html) {
    return '<div class="code"><div class="code-bar"><span>' + label + '</span>' +
      '<button class="copy" type="button" data-copy>Copy</button></div>' +
      '<pre><code>' + (html ?? escHtml(text)) + '</code></pre></div>';
  }
  function endpoints(rows) {
    return '<div class="eps">' + rows.map(([m, path, d]) => m
      ? '<div class="ep"><span class="m ' + m + '">' + m + '</span><code>' + escHtml(path) + '</code><span class="d">' + escHtml(d) + '</span></div>'
      : '<div class="ep label"><code>' + escHtml(path) + '</code><span class="d">' + escHtml(d) + '</span></div>').join('') + '</div>';
  }
  function specText(it) {
    const L = ['# ' + it.title, '', it.brief, ''];
    const rows = (r) => r.forEach(([m, p, d]) => L.push('- ' + (m ? m + ' ' : '') + p + '  ->  ' + d));
    if (it.upstream) { L.push('## Mock upstream (build this too)'); rows(it.upstream); L.push(''); }
    if (it.endpoints) { L.push('## Your endpoints'); rows(it.endpoints); L.push(''); }
    L.push('## Requirements'); it.rules.forEach((r) => L.push('- ' + r));
    if (it.sample) L.push('', '## Sample', '\`\`\`', it.sample, '\`\`\`');
    return L.join('\\n');
  }

  function open(id) {
    current = id;
    const it = D.items[id], d = dayOf[id];
    sheet.style.setProperty('--c', d.color);
    $('#sheet-kick').textContent = (it.tag ? it.tag + ' · ' : '') + d.label + ' · ' + d.title + ' · ' + it.min + ' min';
    $('#sheet-title').textContent = it.title;
    $('#sheet-what').textContent = it.what;

    let h = '';
    if (it.kind === 'step') {
      h += '<section><h4>Do</h4><ul class="tasks">' + it.tasks.map((t, i) => {
        const key = id + ':' + i;
        return '<li><label><input type="checkbox" data-tick="' + key + '"' + (ticks[key] ? ' checked' : '') + '><span>' + escHtml(t) + '</span></label></li>';
      }).join('') + '</ul></section>';
      h += '<section><h4>Code</h4>' + codeBlock(it.lang, it.code, it.html) + '</section>';
    } else {
      h += '<p class="brief">' + escHtml(it.brief) + '</p>';
      if (it.upstream) h += '<section><h4>Mock upstream · build this too</h4>' + endpoints(it.upstream) + '</section>';
      if (it.endpoints) h += '<section><h4>Your endpoints</h4>' + endpoints(it.endpoints) + '</section>';
      h += '<section><h4>Requirements</h4><ul class="rules">' + it.rules.map((r) => '<li>' + escHtml(r) + '</li>').join('') + '</ul></section>';
      if (it.sample) h += '<section><h4>Sample</h4>' + codeBlock('example', it.sample) + '</section>';
      h += '<section><h4>Starter code</h4>' + codeBlock(it.lang, it.code, it.html) + '</section>';
    }
    const body = $('#sheet-body');
    body.innerHTML = h;
    body.scrollTop = 0;

    $$('[data-tick]', body).forEach((cb) => cb.addEventListener('change', () => {
      if (cb.checked) ticks[cb.dataset.tick] = 1; else delete ticks[cb.dataset.tick];
      store.set('nmr-ticks', ticks);
    }));
    $$('[data-copy]', body).forEach((b) => b.addEventListener('click', () => copy(b.closest('.code').querySelector('code').textContent, b)));

    updateBuiltBtn();
    $('#copyspec').hidden = it.kind !== 'project';
    const i = order.indexOf(id);
    $('#prev').disabled = i === 0;
    $('#next').disabled = i === order.length - 1;
    if (!sheet.open) sheet.showModal();
  }
  function updateBuiltBtn() {
    const b = $('#built'), on = !!built[current];
    b.textContent = on ? '✓ Built · undo' : 'Mark as built';
    b.classList.toggle('is-done', on);
  }
  function copy(text, btn) {
    const label = btn.textContent;
    const done = (msg) => { btn.textContent = msg; setTimeout(() => { btn.textContent = label; }, 1400); };
    try {
      navigator.clipboard.writeText(text).then(() => done('Copied'), () => done('Select and copy'));
    } catch { done('Select and copy'); }
  }

  $$('.card').forEach((c) => {
    const id = c.dataset.id;
    c.querySelector('.open').addEventListener('click', () => open(id));
    c.querySelector('.tick').addEventListener('click', () => toggle(id));
  });
  $('#close').addEventListener('click', () => sheet.close());
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
  $('#built').addEventListener('click', () => { toggle(current); updateBuiltBtn(); });
  $('#copyspec').addEventListener('click', (e) => copy(specText(D.items[current]), e.currentTarget));
  $('#prev').addEventListener('click', () => open(order[order.indexOf(current) - 1]));
  $('#next').addEventListener('click', () => open(order[order.indexOf(current) + 1]));
  sheet.addEventListener('keydown', (e) => {
    if (e.target.matches('input')) return;
    if (e.key === 'ArrowRight' && !$('#next').disabled) open(order[order.indexOf(current) + 1]);
    if (e.key === 'ArrowLeft' && !$('#prev').disabled) open(order[order.indexOf(current) - 1]);
  });

  render();
})();
</script>
`;

const full = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="A code-only Node.js microservices roadmap with real assessment projects and a containers track.">
${body.split('\n<header class="top wrap">')[0]}
</head>
<body>
<header class="top wrap">${body.split('\n<header class="top wrap">')[1]}
</body>
</html>
`;

await mkdir(new URL('docs/', root), { recursive: true });
await writeFile(new URL('docs/index.html', root), full);
await writeFile(new URL('docs/.nojekyll', root), '');
// Optional: the same page without the document wrapper, for hosts that add their own.
if (process.env.EMBED_OUT) await writeFile(process.env.EMBED_OUT, body);
console.log(`docs/index.html: ${days.length} sections, ${all.length} cards, ${hm(totalMin)}`);
