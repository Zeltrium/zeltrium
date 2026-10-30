/* Zeltrium — page behaviour.
   Animations: assets/lottie/preview.dat (all 30 from the pack's dark set, one request), played with lottie_light (MIT).
   No cookies and nothing stored in the browser. Outside requests: the free-pack forms post the email to
   MailerLite, and assets/js/goatcounter-count.js (hosted here) counts visits and clicks at GoatCounter. AI states previews load from assets/lottie/ai.dat. */
document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());
let ANIMS = null, SIZES = {};
const NAMES = {success:'Success',error:'Error',warning:'Warning',info:'Info',help:'Help',notification:'Notification',
  download:'Download',upload:'Upload',send:'Send',copy:'Copy',share:'Share',
  add:'Add',edit:'Edit',delete:'Delete',refresh:'Refresh',search:'Search',filter:'Filter',
  toggle:'Toggle',checkbox:'Checkbox',radio_button:'Radio',play_pause:'Play / Pause',visibility:'Visibility',lock:'Lock',
  menu_close:'Menu',expand_collapse:'Expand',settings:'Settings',theme:'Theme',
  like:'Like',favorite:'Favorite',bookmark:'Bookmark'};
// the pack's six categories, in the README's order
const CATS = [
  ['Feedback', ['success','error','warning','info','help','notification']],
  ['Transfer', ['download','upload','send','copy','share']],
  ['Actions', ['add','edit','delete','refresh','search','filter']],
  ['Controls', ['toggle','checkbox','radio_button','play_pause','visibility','lock']],
  ['Navigation & View', ['menu_close','expand_collapse','settings','theme']],
  ['Reactions', ['like','favorite','bookmark']]
];
const ORDER = CATS.flatMap(c => c[1]);
const HERO = ['like','toggle','theme','send','add','notification','download','favorite'];
const FREE = ['success','error','copy','checkbox','refresh'];

// How each file behaves (the same rules as the pack README):
// two  — repeatable state switch (rest at frame 0, play forward = on, play backward = off)
// draw — finishing: draws in from nothing (rest at the last frame, replay from empty)
// fade — download / upload: press → progress → done, rest on done, crossfade back to frame 0 after a hold
// once — one shot that ends where it started (rest at frame 0, replay directly; copy and send play both markers straight through)
const KIND = {};
['like','favorite','bookmark','add','theme','toggle','checkbox','radio_button','menu_close','play_pause','expand_collapse','visibility','lock','filter'].forEach(k => KIND[k] = 'two');
['success','error','warning'].forEach(k => KIND[k] = 'draw');
['download','upload'].forEach(k => KIND[k] = 'fade');
ORDER.forEach(k => { KIND[k] = KIND[k] || 'once'; });
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = false;

// Previews are the pack's dark set. Every color has one of four roles, so a recolor maps role → value.
const ROLE = {line:'#F2F1ED', accent:'#FF4A1C', track:'#2C2C2A', off:'#6B6A65'};
const SET = {
  dark:  {},
  light: {line:'#121212', track:'#E4E2DC', off:'#8A8983'}   // the pack's light set
};
const rgb = h => [parseInt(h.slice(1,3),16)/255, parseInt(h.slice(3,5),16)/255, parseInt(h.slice(5,7),16)/255];
const hexOf = k => '#' + k.slice(0,3).map(v => Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase();
function recolor(key, map){
  const data = JSON.parse(JSON.stringify(ANIMS[key]));
  if (!map || !Object.keys(map).length) return data;
  const swap = {};
  for (const r in map) swap[ROLE[r]] = rgb(map[r]);
  const fix = c => { const to = swap[hexOf(c)]; return to ? [...to, c[3] ?? 1] : c; };
  (function walk(o){
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if (!o || typeof o !== 'object') return;
    if ((o.ty === 'fl' || o.ty === 'st') && o.c) {
      if (o.c.a === 0) o.c.k = fix(o.c.k);
      else if (Array.isArray(o.c.k)) o.c.k.forEach(kf => { if (kf.s) kf.s = fix(kf.s); if (kf.e) kf.e = fix(kf.e); });
    }
    for (const v in o) walk(o[v]);
  })(data);
  return data;
}

// Size each animation by its own canvas so circles match across files (lock and delete are 500×400, toggle 400×200).
function size(el, key, base){
  const a = ANIMS[key].w / ANIMS[key].h;
  if (a <= 1.3) { el.style.height = base + '%'; el.style.width = (base * a) + '%'; }
  else { el.style.width = (base * 1.18) + '%'; el.style.height = (base * 1.18 / a) + '%'; }
}

const players = [];
function hold(){ return 1300 + Math.random() * 900; }
function restFrame(p){ return p.kind === 'draw' ? p.anim.totalFrames - 1 : 0; }
function whenReady(anim, fn){ if (anim.isLoaded) fn(); else anim.addEventListener('DOMLoaded', fn); }

function player(el, key, opts = {}){
  const data = recolor(key, opts.map);
  const anim = lottie.loadAnimation({container:el, renderer:'svg', loop:false, autoplay:false, animationData:data});
  const p = {el, key, anim, kind:KIND[key], on:false, atEnd:false, auto:!!opts.auto && !reduce, visible:true, timer:null, offset:opts.offset || 0};
  whenReady(anim, () => anim.goToAndStop(restFrame(p), true));
  anim.addEventListener('complete', () => {
    p.atEnd = true;
    let next = hold();
    if (p.kind === 'fade' && p.auto) { setTimeout(() => crossTo(p, 0), next); next += 700; }
    if (p.auto) p.timer = setTimeout(() => tick(p), next);
  });
  players.push(p);
  return p;
}
function crossTo(p, frame, then){
  p.el.classList.add('out');
  setTimeout(() => { p.anim.goToAndStop(frame, true); p.atEnd = false; p.el.classList.remove('out'); if (then) then(); }, 190);
}
function play(p){
  const a = p.anim;
  if (p.kind === 'two') {
    if (p.on) { a.setDirection(-1); a.play(); } else { a.setDirection(1); a.play(); }
    p.on = !p.on; return;
  }
  a.setDirection(1);
  if (p.kind === 'draw') { crossTo(p, 0, () => a.play()); return; }
  if (p.kind === 'fade' && p.atEnd) { crossTo(p, 0, () => setTimeout(() => a.play(), 250)); return; }
  p.atEnd = false; a.goToAndPlay(0, true);
}
function tick(p){
  if (!p.auto) return;
  if (paused || !p.visible) { p.timer = setTimeout(() => tick(p), 700); return; }
  play(p);
}
function start(p){ if (p.auto) p.timer = setTimeout(() => tick(p), p.offset); }
function takeOver(p){ p.auto = false; clearTimeout(p.timer); }
function bind(target, p){
  target.addEventListener('click', () => { takeOver(p); play(p); });
  if (reduce && p.kind !== 'two') target.addEventListener('pointerenter', () => play(p));
}

function tile(key, i, cap){
  const b = document.createElement('button');
  b.className = 'tile'; b.type = 'button'; b.setAttribute('aria-label', 'Play ' + NAMES[key]);
  const a = document.createElement('span'); a.className = 'anim'; size(a, key, 56);
  b.appendChild(a);
  if (cap) { const c = document.createElement('span'); c.className = 'cap'; c.innerHTML = '<b>' + NAMES[key] + '</b><span>' + SIZES[key] + ' KB</span>'; b.appendChild(c); }
  const p = player(a, key, {auto:true, offset:300 + i * 260});
  bind(b, p);
  return {b, p};
}

// where the visitor came from: ?ref= label from our own links, else the referring site's domain.
// Sent to MailerLite as the subscriber's "channel" field; nothing is stored in the browser.
const SOURCE = (() => {
  const known = {'t.co':'x','x.com':'x','twitter.com':'x','reddit.com':'reddit','indiehackers.com':'ih','dev.to':'devto',
    'lottiefiles.com':'lottiefiles','framer.com':'framer','iconscout.com':'is','gumroad.com':'gumroad','mailerlite.com':'email',
    'google.com':'search','bing.com':'search','duckduckgo.com':'search','github.com':'github','linkedin.com':'linkedin'};
  let ref = '';
  try { ref = (new URLSearchParams(location.search).get('ref') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30); } catch (_) {}
  if (ref) return ref;
  let host = '';
  try { host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (_) {}
  if (!host) return 'direct';
  if (host === location.hostname.replace(/^www\./, '')) return '';
  const hit = Object.keys(known).find(k => host === k || host.endsWith('.' + k));
  return hit ? known[hit] : host.slice(0, 60);
})();

// free-pack forms → MailerLite (double opt-in is switched on in MailerLite). One form per free pack.
function wireForm(prefix, label){
  const $ = x => document.getElementById(prefix + x);
  const form = $('form'), email = $('email'), err = $('email-err'), sent = $('sent'), submit = $('submit');
  if (!form) return;
  let sentP = null;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (form.website.value) return; // bot filled the hidden field
    const value = email.value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    err.textContent = 'Enter an email like you@domain.com.';
    err.hidden = ok; email.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (!ok) { email.focus(); return; }
    submit.disabled = true; submit.textContent = 'Sending…';
    const data = new FormData();
    data.append('fields[email]', value);
    if (SOURCE) data.append('fields[channel]', SOURCE);
    data.append('ml-submit', '1');
    data.append('anticsrf', 'true');
    try {
      await fetch(form.action, {method:'POST', body:data, mode:'no-cors'});
      $('sent-to').textContent = value;
      form.hidden = true; sent.hidden = false;
      if (window.goatcounter && goatcounter.count) goatcounter.count({path:prefix + 'signup', title:label, event:true});
      if (window.lottie && window.ANIMS) { if (!sentP) sentP = player($('sent-anim'), 'success', {map:SET.light}); play(sentP); }
    } catch (x) {
      err.textContent = 'Couldn\'t reach the mail server. Check your connection and try again, or email hello@zeltrium.com.';
      err.hidden = false;
    } finally {
      submit.disabled = false; submit.textContent = label;
    }
  });
  $('reset').addEventListener('click', () => { sent.hidden = true; form.hidden = false; email.value = ''; email.focus(); });
}

// previews are lightly encoded so the files aren't one right-click away
function decode(txt){
  const key = 'zeltrium-motion', bin = atob(txt.trim()), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) ^ key.charCodeAt(i % key.length);
  return JSON.parse(new TextDecoder().decode(out));
}
fetch('assets/lottie/preview.dat').then(r => r.text()).then(decode).then(d => {
  ANIMS = d.anims; SIZES = d.sizes; window.ANIMS = ANIMS;
  if (!window.lottie) return;
  init();
}).catch(() => {});

function init(){
// hero
const hg = document.getElementById('hero-grid');
if (hg) {
HERO.forEach((k, i) => hg.appendChild(tile(k, i, true).b));
const hint = document.createElement('div'); hint.className = 'hint';
hint.innerHTML = '<span>click any tile</span>';
const mb = document.createElement('button'); mb.type = 'button'; mb.className = 'motion-btn'; mb.id = 'motion-btn';
mb.setAttribute('aria-pressed', 'false'); mb.textContent = reduce ? 'Motion: on click' : 'Pause motion';
if (reduce) mb.disabled = true;
mb.addEventListener('click', () => { paused = !paused; mb.setAttribute('aria-pressed', String(paused)); mb.textContent = paused ? 'Play motion' : 'Pause motion'; });
hint.appendChild(mb); hg.appendChild(hint);
}

// full pack, with a category filter
const pg = document.getElementById('pack-grid');
if (pg) {
const packTiles = ORDER.map((k, i) => { const t = tile(k, i % 6, true); t.b.dataset.key = k; pg.appendChild(t.b); return t; });
const cf = document.getElementById('cat-filter');
[['All', ORDER]].concat(CATS).forEach(([name, keys], i) => {
  const c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
  c.innerHTML = name + ' <span>' + keys.length + '</span>';
  c.addEventListener('click', () => {
    cf.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', 'false')); c.setAttribute('aria-pressed', 'true');
    packTiles.forEach(t => { const show = keys.includes(t.b.dataset.key); t.b.hidden = !show; t.p.visible = show; });
  });
  cf.appendChild(c);
});
}

// compact grid on the studio page: all 30, small, clickable
const mg = document.getElementById('mini-grid');
if (mg) ORDER.forEach((k, i) => mg.appendChild(tile(k, i % 10, false).b));

// free five
const fr = document.getElementById('free-row');
if (fr) {
FREE.forEach((k, i) => fr.appendChild(tile(k, i, false).b));
}

// product mosaic
const pv = document.getElementById('prod-visual');
if (pv) {
ORDER.forEach((k, i) => {
  const m = document.createElement('div'); m.className = 'mini';
  const a = document.createElement('span'); a.className = 'anim'; size(a, k, 58); m.appendChild(a); pv.appendChild(m);
  start(player(a, k, {auto:true, offset:500 + (i * 397) % 4000}));
});
}

// before / after: the static side stays on its resting frame; the live side plays once on arrival, then waits for you
document.querySelectorAll('[data-static]').forEach(el => player(el, el.dataset.static));
const live = [];
document.querySelectorAll('[data-live]').forEach(btn => { const p = player(btn.querySelector('.anim'), btn.dataset.live); bind(btn, p); live.push(p); });
if (document.querySelector('.panel.live')) {
const baIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  baIO.disconnect();
  if (!reduce) live.forEach((p, i) => setTimeout(() => play(p), 500 + i * 650));
}), {threshold:.6});
baIO.observe(document.querySelector('.panel.live'));
}

// code
const SNIPS = {
  React: '<span class="k">import</span> Lottie <span class="k">from</span> "lottie-react";\n<span class="k">import</span> like <span class="k">from</span> "./zeltrium/json/dark/like.json";\n\n&lt;Lottie animationData={like} loop={false} /&gt;',
  Swift: '<span class="k">import</span> Lottie\n\n<span class="k">let</span> like = LottieAnimationView(name: "like")\nlike.play()',
  Android: '&lt;com.airbnb.lottie.LottieAnimationView\n    app:lottie_rawRes="@raw/like"\n    app:lottie_autoPlay="false" /&gt;',
  Flutter: '<span class="k">import</span> \'package:lottie/lottie.dart\';\n\nLottie.asset(\'assets/zeltrium/like.json\', repeat: false)',
  Framer: '<span class="c">// No code</span>\n1. Insert → Lottie\n2. Drop like.lottie into the file field\n3. Playback: On Click',
  Webflow: '<span class="c">// No code</span>\n1. Add → Lottie Animation\n2. Upload like.json\n3. Interactions → Mouse click → Play Lottie'
};
const tabs = document.getElementById('tabs'), pre = document.getElementById('code-pre');
if (tabs) {
Object.keys(SNIPS).forEach((name, i) => {
  const t = document.createElement('button'); t.type = 'button'; t.setAttribute('role', 'tab'); t.textContent = name; t.id = 'tab-' + name;
  t.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
  t.addEventListener('click', () => { tabs.querySelectorAll('button').forEach(x => x.setAttribute('aria-selected', 'false')); t.setAttribute('aria-selected', 'true'); pre.innerHTML = SNIPS[name]; });
  tabs.appendChild(t);
});
pre.innerHTML = SNIPS.React;
const copyP = player(document.getElementById('copy-anim'), 'copy');
document.getElementById('copy-btn').addEventListener('click', () => {
  const label = document.getElementById('copy-label');
  const done = () => { play(copyP); label.textContent = 'Copied'; setTimeout(() => label.textContent = 'Copy', 1400); };
  const fallback = () => { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); label.textContent = 'Selected'; };
  try { navigator.clipboard.writeText(pre.textContent).then(done, fallback); } catch (e) { fallback(); }
});
}

// recolor: each swatch is a role map on top of the dark or light set
if (document.getElementById('rc-grid')) {
const SW = [
  ['Zeltrium', {}, '#FF4A1C'],
  ['Ocean',  {accent:'#2F7DFD'}, '#2F7DFD'],
  ['Mint',   {accent:'#2FBF71'}, '#2FBF71'],
  ['Violet', {accent:'#9364E4'}, '#9364E4'],
  ['Light',  Object.assign({}, SET.light), '#F2F1ED', true]
];
const RC = ['like','toggle','theme','success'];
const rcGrid = document.getElementById('rc-grid');
let rcPlayers = [];
function buildRC(map, light){
  rcPlayers.forEach(p => { takeOver(p); p.anim.destroy(); });
  rcPlayers = []; rcGrid.innerHTML = ''; rcGrid.classList.toggle('on-light', !!light);
  RC.forEach((k, i) => {
    const b = document.createElement('button'); b.className = 'tile'; b.type = 'button'; b.setAttribute('aria-label', 'Play ' + NAMES[k]);
    const a = document.createElement('span'); a.className = 'anim'; size(a, k, 56); b.appendChild(a);
    const c = document.createElement('span'); c.className = 'cap'; c.innerHTML = '<b>' + NAMES[k] + '</b>'; b.appendChild(c);
    rcGrid.appendChild(b);
    const p = player(a, k, {auto:true, map, offset:150 + i * 220}); bind(b, p); start(p); rcPlayers.push(p);
  });
}
const swWrap = document.getElementById('swatches');
SW.forEach(([name, map, color, light], i) => {
  const s = document.createElement('button'); s.type = 'button'; s.className = 'sw'; s.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
  s.innerHTML = '<i style="background:' + color + '"></i>' + name;
  s.addEventListener('click', () => { swWrap.querySelectorAll('.sw').forEach(x => x.setAttribute('aria-pressed', 'false')); s.setAttribute('aria-pressed', 'true'); buildRC(map, light); });
  swWrap.appendChild(s);
});
buildRC({}, false);
}

// start loops, pause what is off screen
const io = new IntersectionObserver(es => es.forEach(e => { const p = players.find(x => x.el === e.target); if (p) p.visible = e.isIntersecting; }));
players.forEach(p => { io.observe(p.el); if (p.auto && !p.timer) start(p); });

// the grids above were empty when the browser jumped to #free or #product, so jump again now that they are filled
if (location.hash.length > 1) { const t = document.getElementById(location.hash.slice(1)); if (t) requestAnimationFrame(() => t.scrollIntoView()); }
}

wireForm('free-', 'Send me the pack');
wireForm('ai-', 'Send me the states');

/* AI states: a small demo chat plus five tiles. Loads assets/lottie/ai.dat only when the section comes near. */
(function(){
  const sec = document.getElementById('ai');
  if (!sec) return;
  const AI = {};
  const AI_NAMES = {thinking:'Thinking', typing:'Typing', send_stop:'Send → stop', listening:'Listening', searching:'Searching'};
  const STOP = {};
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const load = el => lottie.loadAnimation({container:el, renderer:'svg', loop:false, autoplay:false, animationData:JSON.parse(JSON.stringify(AI[el.dataset.k]))});
  // play frames a→b (a > b plays backwards) and land exactly on b, so every state rests on its marker frame.
  // (playSegments treats the end as exclusive and stops one frame short, which left half-drawn icons.)
  function seg(anim, a, b){
    if (anim.__segOff) anim.__segOff();
    const last = anim.totalFrames - 1;
    a = Math.min(a, last); b = Math.min(b, last);
    return new Promise(res => {
      const dir = b >= a ? 1 : -1;
      const off = () => { anim.removeEventListener('enterFrame', tick); anim.removeEventListener('complete', end); anim.__segOff = null; };
      const end = () => { off(); anim.goToAndStop(b, true); res(); };
      const tick = () => { if (dir > 0 ? anim.currentFrame >= b : anim.currentFrame <= b) end(); };
      anim.__segOff = off;
      anim.addEventListener('enterFrame', tick);
      anim.addEventListener('complete', end);
      anim.goToAndStop(a, true);
      anim.setDirection(dir);
      anim.play();
    });
  }
  const mk = (anim, name) => { const m = anim.animationData.markers.find(x => x.cm === name); return [m.tm, m.tm + m.dr]; };

  function start(){
    // tiles: each one runs its own cycle on click, and on its own while visible
    const row = document.getElementById('ai-row');
    const tiles = Object.keys(AI_NAMES).map((k, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tile'; b.setAttribute('aria-label', 'Play ' + AI_NAMES[k]);
      const a = document.createElement('span'); a.className = 'anim'; a.dataset.k = k; a.style.width = a.style.height = '50%';
      const c = document.createElement('span'); c.className = 'cap'; c.innerHTML = '<b>' + AI_NAMES[k] + '</b>';
      b.append(a, c); row.appendChild(b);
      const t = {k, anim:load(a), busy:false, auto:!reduce, visible:false};
      whenReady(t.anim, () => { if (k !== 'send_stop') t.anim.goToAndStop(mk(t.anim, 'loop')[0], true); });
      t.cycle = async () => {
        if (t.busy) return; t.busy = true;
        const an = t.anim;
        // at rest a tile shows the start of its loop; a cycle is loop, loop, out, then in again
        if (k === 'send_stop') { await seg(an, 0, 16); await wait(900); await seg(an, 16, 0); }
        else { const [i0, i1] = mk(an, 'in'), [l0, l1] = mk(an, 'loop'), [o0, o1] = mk(an, 'out');
          await seg(an, l0, l1); await seg(an, l0, l1); await seg(an, o0, o1); await wait(500); await seg(an, i0, i1); }
        t.busy = false;
      };
      b.addEventListener('click', () => { t.auto = false; t.cycle(); });
      return t;
    });
    const tio = new IntersectionObserver(es => es.forEach(e => { tiles.forEach(t => t.visible = e.isIntersecting); }));
    tio.observe(row);
    tiles.forEach((t, i) => (async () => { await wait(400 + i * 500); for (;;) { if (t.auto && t.visible && !paused) { await t.cycle(); await wait(1200 + Math.random() * 800); } else await wait(600); } })());

    // chat
    const log = document.getElementById('chat-log'), box = document.getElementById('composer-text');
    const micBtn = document.getElementById('mic-btn'), sendBtn = document.getElementById('send-btn');
    const micEl = document.getElementById('mic-anim'), sendEl = document.getElementById('send-anim');
    micEl.dataset.k = 'listening'; sendEl.dataset.k = 'send_stop';
    const mic = load(micEl), send = load(sendEl);
    const SCRIPT = [
      {q:'Which Lottie player works in Flutter?', search:true, a:'The lottie package. Add it to pubspec.yaml, then call Lottie.asset(\'like.json\', repeat: false).'},
      {q:'Make the like button feel alive', voice:true, a:'Play the like animation forward on tap and backwards on undo. Rest on frame 0, so it never looks stuck.'}
    ];
    let run = 0, busy = false, turn = 0, visible = false, auto = !reduce, generating = false;
    const check = id => { if (id !== run) throw STOP; };
    const placeholder = () => { box.innerHTML = '<span class="ph">Ask anything</span>'; };
    async function typeInto(el, text, ms, id){ el.textContent = ''; for (const ch of text) { check(id); el.textContent += ch; await wait(ms); } }
    function bubble(cls){ const d = document.createElement('div'); d.className = 'msg ' + cls; log.appendChild(d); while (log.children.length > 4) log.firstChild.remove(); return d; }
    function status(){
      const d = bubble('bot'); const i = document.createElement('span'); i.className = 'anim st'; const t = document.createElement('span'); t.className = 'st-t';
      d.append(i, t); return {d, i, t, anim:null};
    }
    async function show(st, k, label, cycles, id){
      if (st.anim) st.anim.destroy();
      st.i.dataset.k = k; st.anim = load(st.i); st.t.textContent = label; st.t.className = 'st-t dim';
      const [i0, i1] = mk(st.anim, 'in'), [l0, l1] = mk(st.anim, 'loop'), [o0, o1] = mk(st.anim, 'out');
      await seg(st.anim, i0, i1); check(id);
      for (let n = 0; n < cycles; n++) { await seg(st.anim, l0, l1); check(id); }
      await seg(st.anim, o0, o1); check(id);
    }
    async function ask(voice){
      if (busy) return;
      const id = ++run; busy = true;
      const s = SCRIPT[turn++ % SCRIPT.length];
      try {
        if (voice ?? s.voice) {
          micBtn.classList.add('on'); micBtn.setAttribute('aria-pressed', 'true');
          const [i0, i1] = mk(mic, 'in'), [l0, l1] = mk(mic, 'loop'), [o0, o1] = mk(mic, 'out');
          const p = seg(mic, i0, i1).then(() => seg(mic, l0, l1));
          await wait(350); check(id);
          box.innerHTML = '<span></span>'; await typeInto(box.firstChild, s.q, 38, id);
          await p; check(id); await seg(mic, o0, o1);
          micBtn.classList.remove('on'); micBtn.setAttribute('aria-pressed', 'false');
        } else {
          box.innerHTML = '<span></span>'; await typeInto(box.firstChild, s.q, 45, id);
        }
        await wait(300); check(id);
        // send → stop
        generating = true; sendBtn.setAttribute('aria-label', 'Stop generating');
        seg(send, 0, 16);
        const u = bubble('user'); u.textContent = s.q; placeholder();
        const st = status();
        if (s.search) await show(st, 'searching', 'Searching the web', 1, id);
        await show(st, 'thinking', 'Thinking', 1, id);
        // typing: icon loops while the answer streams in
        st.anim.destroy(); st.i.dataset.k = 'typing'; st.anim = load(st.i); st.t.textContent = ''; st.t.className = 'st-t';
        const [i0, i1] = mk(st.anim, 'in'), [l0, l1] = mk(st.anim, 'loop'), [o0, o1] = mk(st.anim, 'out');
        await seg(st.anim, i0, i1);
        let streaming = true;
        const loopIcon = (async () => { while (streaming && id === run) await seg(st.anim, l0, l1); })();
        await typeInto(st.t, s.a, 22, id);
        streaming = false; await loopIcon; check(id);
        await seg(st.anim, o0, o1); st.anim.destroy(); st.i.remove(); st.d.classList.add('done');
        await finish();
      } catch (e) { if (e !== STOP) throw e; }
      finally { if (id === run) busy = false; }
    }
    async function finish(){
      if (!generating) return;
      generating = false; sendBtn.setAttribute('aria-label', 'Send');
      await seg(send, 16, 0);
    }
    async function stop(){
      run++; busy = false;
      log.querySelectorAll('.st').forEach(el => el.remove());
      const last = log.lastElementChild;
      if (last && last.classList.contains('bot')) { last.classList.add('done'); const t = last.querySelector('.st-t'); if (t && t.classList.contains('dim')) t.textContent = 'Stopped.'; else if (t) t.textContent += ' …'; }
      micBtn.classList.remove('on'); mic.goToAndStop(0, true); placeholder();
      await finish();
    }
    sendBtn.addEventListener('click', () => { auto = false; if (generating) stop(); else ask(false); });
    micBtn.addEventListener('click', () => { auto = false; if (busy) return; ask(true); });
    new IntersectionObserver(es => es.forEach(e => visible = e.isIntersecting), {threshold:.4}).observe(document.getElementById('chat'));
    // no autoplay with reduced motion: show one finished exchange instead
    if (reduce) { const u = bubble('user'); u.textContent = SCRIPT[0].q; const b = bubble('bot done'); b.innerHTML = '<span class="st-t"></span>'; b.firstChild.textContent = SCRIPT[0].a; turn = 1; }
    (async () => { for (;;) { if (auto && visible && !paused && !busy) { await ask(); await wait(2600); } else await wait(700); } })();
  }

  const io = new IntersectionObserver(es => {
    if (!es.some(e => e.isIntersecting)) return;
    io.disconnect();
    fetch('assets/lottie/ai.dat').then(r => r.text()).then(decode).then(d => {
      Object.assign(AI, d.anims);
      if (window.lottie) whenLottie();
    }).catch(() => {});
  }, {rootMargin:'600px 0px'});
  function whenLottie(){ start(); }
  io.observe(sec);
})();

// work clips: load and play only while on screen; with reduced motion they wait for a tap
(function(){
  const vids = document.querySelectorAll('.work-media video');
  if (!vids.length) return;
  const webm = document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
  const load = v => { if (!v.src) v.src = webm ? v.dataset.src.replace(/\.mp4$/, '.webm') : v.dataset.src; };
  vids.forEach(v => v.parentElement.addEventListener('click', () => { load(v); if (v.paused) { v.dataset.user = '1'; v.play().catch(() => {}); } else { v.dataset.user = '0'; v.pause(); } }));
  if (reduce || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (v.dataset.user !== '0' && !paused) { load(v); v.play().catch(() => {}); } }
    else v.pause();
  }), {threshold:.35});
  vids.forEach(v => io.observe(v));
})();
