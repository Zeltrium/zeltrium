/* Zeltrium — studio page behaviour (index.html). The pack page uses script.js.
   No cookies and nothing stored in the browser. The brief form sends nothing: it opens the visitor's email app. */
document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    if (e.isIntersecting) { if (v.dataset.user !== '0') { load(v); v.play().catch(() => {}); } }
    else v.pause();
  }), {threshold:.35});
  vids.forEach(v => io.observe(v));
})();

// brief form → a prefilled email
(function(){
  const form = document.getElementById('brief');
  if (!form) return;
  const val = id => document.getElementById(id).value.trim();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = val('b-name'), company = val('b-company'), need = val('b-need');
    const subject = need + (company ? ' for ' + company : '');
    const lines = [
      'Hi Roman,', '',
      'What we need: ' + need,
      'Timeline: ' + (val('b-time') || '—'),
      'Brief or link: ' + (val('b-link') || '—'), '',
      val('b-msg') || '', '',
      name ? name + (company ? ', ' + company : '') : (company || '')
    ];
    location.href = 'mailto:hello@zeltrium.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n').replace(/\n{3,}/g, '\n\n').trim());
  });
})();
