# zeltrium.com

Static site for Zeltrium, a motion studio for digital products. Hosted on GitHub Pages (custom domain in `CNAME`).

- `index.html` — the studio page for studios and product teams: hero (the pack video as proof), selected work, the live 30-animation pack, two ways to work, white-label, process, FAQ, brief form (opens the visitor's email app, sends nothing). Old pack anchors (`/#free`, `/#ai`, …) redirect to `packs.html`
- `packs.html` — the Lottie packs: hero, before/after, the 30-animation pack, code, recolor, free 5, full pack, 5 free AI states (demo chat), FAQ
- `styles.css` — styles for all pages; `script.js` — animations, work clips and forms on both pages (each block runs only if its section is on the page); `main.js` — the brief form on `index.html`
- `imprint.html`, `privacy.html`, `contact.html`, `license.html` — legal and info pages
- `assets/lottie/preview.dat` — all 30 animations for the on-page previews (pack v1.0 dark set), lightly encoded, not a download
- `assets/lottie/ai.dat` — the 5 AI states (dark set) for the demo chat and tiles, same encoding, loaded only when the section comes near
- `assets/js/lottie_light.min.js` — lottie-web light player (MIT, see `lottie-web-LICENSE.md`)
- `assets/js/goatcounter-count.js` — our copy of GoatCounter's count.js (ISC): no screen width, no localStorage
- `assets/work/` — clips (WebM + MP4), posters and the portrait for the studio page (`ui30` and `ai-states` are cut from the Behance case videos)
- `assets/fonts/` — Bricolage Grotesque, Onest, JetBrains Mono, Latin subset (SIL OFL)
- `assets/brand/`, `assets/icons/` — logo, symbol, favicons, Open Graph image
- `assets/email/` — images used in the MailerLite emails
- `email/` — source HTML of the two delivery emails (free 5, AI states)
- `downloads/` — `zeltrium-free-5.zip` and `zeltrium-ai-states-free.zip`, shown right after sign-up and linked in the emails
- `free/` — files for dev.to lessons

No cookies and nothing stored in the browser. Outside requests: the two free-pack forms post the
email address to MailerLite (double opt-in), and GoatCounter counts visits and clicks without
storing IP addresses. Contact: hello@zeltrium.com.
