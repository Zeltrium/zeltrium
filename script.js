/* Zeltrium — page behaviour.
   Animations: assets/lottie/preview.dat (all 30 from the pack's dark set, one request), played with lottie_light (MIT).
   No cookies, no analytics, no third-party scripts. The only outside request is the
   free-pack form posting the email to MailerLite. */
document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());
let ANIMS = null, SIZES = {};
const NAMES = {like:'Like',toggle:'Toggle',send:'Send',delete:'Delete',notification:'Notification',menu_close:'Menu',download:'Download',favorite:'Favorite',bookmark:'Bookmark',theme:'Theme',add:'Add',visibility:'Visibility',lock:'Lock',upload:'Upload',success:'Success',error:'Error',warning:'Warning',info:'Info',help:'Help',copy:'Copy',edit:'Edit',share:'Share',search:'Search',filter:'Filter',settings:'Settings',refresh:'Refresh',checkbox:'Checkbox',radio_button:'Radio',play_pause:'Play / Pause',expand_collapse:'Expand'};
const ORDER = Object.keys(NAMES);
const HERO = ['like','toggle','theme','send','add','notification','download','favorite'];
const FREE = ['success','error','copy','checkbox','refresh'];

// How each file behaves (the same rules as the pack README):
// two  — repeatable state switch (rest at frame 0, play forward = on, play backward = off)
// draw — finishing: draws in from nothing (rest at the last frame, replay from empty)
// seg  — two markers: play the first, hold, play the second back to rest (copy → reset, send → return)
// fade — download / upload: press → progress → done, rest on done, crossfade back to frame 0 after a hold
// once — one shot that ends where it started (rest at frame 0, replay directly)
const KIND = {};
['like','favorite','bookmark','add','theme','toggle','checkbox','radio_button','menu_close','play_pause','expand_collapse','visibility','lock','filter'].forEach(k => KIND[k] = 'two');
['success','error','warning'].forEach(k => KIND[k] = 'draw');
['copy','send'].forEach(k => KIND[k] = 'seg');
['download','upload'].forEach(k => KIND[k] = 'fade');
const SEG_HOLD = {copy: 1300, send: 450};
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
  const p = {el, key, anim, kind:KIND[key], on:false, atEnd:false, auto:!!opts.auto && !reduce, visible:true, timer:null, offset:opts.offset || 0, stage:0,
    marks:(data.markers || []).map(m => [m.tm, m.tm + m.dr])};
  whenReady(anim, () => anim.goToAndStop(restFrame(p), true));
  anim.addEventListener('complete', () => {
    if (p.kind === 'seg' && p.stage === 1) { // first marker done: hold, then play the second back to rest
      p.stage = 2; p.segTimer = setTimeout(() => anim.playSegments(p.marks[1], true), SEG_HOLD[p.key] || 800); return;
    }
    if (p.kind === 'seg') { p.stage = 0; anim.resetSegments(true); anim.goToAndStop(0, true); }
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
  if (p.kind === 'seg') {
    if (p.stage) return; // already running
    p.stage = 1; p.atEnd = false; a.playSegments(p.marks[0], true); return;
  }
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

// free-pack form → MailerLite (double opt-in is switched on in MailerLite)
(function(){
  const form = document.getElementById('free-form'), email = document.getElementById('email'), err = document.getElementById('email-err');
  const sent = document.getElementById('sent'), submit = document.getElementById('free-submit');
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
    data.append('ml-submit', '1');
    data.append('anticsrf', 'true');
    try {
      await fetch(form.action, {method:'POST', body:data, mode:'no-cors'});
      document.getElementById('sent-to').textContent = value;
      form.hidden = true; sent.hidden = false;
      if (window.lottie && window.ANIMS) { if (!sentP) sentP = player(document.getElementById('sent-anim'), 'success', {map:SET.light}); play(sentP); }
    } catch (x) {
      err.textContent = 'Couldn\'t reach the mail server. Check your connection and try again, or email zeltriumstudio@gmail.com.';
      err.hidden = false;
    } finally {
      submit.disabled = false; submit.textContent = 'Send me the pack';
    }
  });
  document.getElementById('reset-form').addEventListener('click', () => { sent.hidden = true; form.hidden = false; email.value = ''; email.focus(); });
})();

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
HERO.forEach((k, i) => hg.appendChild(tile(k, i, true).b));
const hint = document.createElement('div'); hint.className = 'hint';
hint.innerHTML = '<span>click any tile</span>';
const mb = document.createElement('button'); mb.type = 'button'; mb.className = 'motion-btn'; mb.id = 'motion-btn';
mb.setAttribute('aria-pressed', 'false'); mb.textContent = reduce ? 'Motion: on click' : 'Pause motion';
if (reduce) mb.disabled = true;
mb.addEventListener('click', () => { paused = !paused; mb.setAttribute('aria-pressed', String(paused)); mb.textContent = paused ? 'Play motion' : 'Pause motion'; });
hint.appendChild(mb); hg.appendChild(hint);

// full pack
const pg = document.getElementById('pack-grid');
ORDER.forEach((k, i) => pg.appendChild(tile(k, i % 6, true).b));

// free five
const fr = document.getElementById('free-row');
FREE.forEach((k, i) => fr.appendChild(tile(k, i, false).b));

// product mosaic
const pv = document.getElementById('prod-visual');
ORDER.forEach((k, i) => {
  const m = document.createElement('div'); m.className = 'mini';
  const a = document.createElement('span'); a.className = 'anim'; size(a, k, 58); m.appendChild(a); pv.appendChild(m);
  start(player(a, k, {auto:true, offset:500 + (i * 397) % 4000}));
});

// before / after: the static side stays on its resting frame; the live side plays once on arrival, then waits for you
document.querySelectorAll('[data-static]').forEach(el => player(el, el.dataset.static));
const live = [];
document.querySelectorAll('[data-live]').forEach(btn => { const p = player(btn.querySelector('.anim'), btn.dataset.live); bind(btn, p); live.push(p); });
const baIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  baIO.disconnect();
  if (!reduce) live.forEach((p, i) => setTimeout(() => play(p), 500 + i * 650));
}), {threshold:.6});
baIO.observe(document.querySelector('.panel.live'));

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
  const done = () => { play(copyP); label.textContent = 'Copied'; setTimeout(() => label.textContent = 'Copy', 1500); };
  const fallback = () => { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); label.textContent = 'Selected'; };
  try { navigator.clipboard.writeText(pre.textContent).then(done, fallback); } catch (e) { fallback(); }
});

// recolor: each swatch is a role map on top of the dark or light set
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

// start loops, pause what is off screen
const io = new IntersectionObserver(es => es.forEach(e => { const p = players.find(x => x.el === e.target); if (p) p.visible = e.isIntersecting; }));
players.forEach(p => { io.observe(p.el); if (p.auto && !p.timer) start(p); });
buildRC({}, false);
}
