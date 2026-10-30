/* Zeltrium — brief form on the studio page (index.html). The pack grid, work clips and year come from script.js.
   No cookies and nothing stored in the browser. The brief form sends nothing: it opens the visitor's email app. */

// work clips play through script.js, which this page loads for the pack grid

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
