# zeltrium.com

Static site for Zeltrium, a motion studio for digital products. Hosted on GitHub Pages (custom domain in `CNAME`).

- `index.html` — the page: hero, before/after, the 30-animation pack, code, recolor, free 5, full pack, 5 free AI states (demo chat), custom work, selected work, about, FAQ
- `styles.css`, `script.js` — styles and behaviour
- `imprint.html`, `privacy.html`, `contact.html`, `license.html` — legal and info pages
- `assets/lottie/preview.dat` — all 30 animations for the on-page previews (pack v1.0 dark set), lightly encoded, not a download
- `assets/lottie/ai.dat` — the 5 AI states (dark set) for the demo chat and tiles, same encoding, loaded only when the section comes near
- `assets/js/lottie_light.min.js` — lottie-web light player (MIT, see `lottie-web-LICENSE.md`)
- `assets/js/goatcounter-count.js` — our copy of GoatCounter's count.js (ISC): no screen width, no localStorage
- `assets/work/` — clips (WebM + MP4), posters and the portrait for the work and about sections
- `assets/fonts/` — Bricolage Grotesque, Onest, JetBrains Mono, Latin subset (SIL OFL)
- `assets/brand/`, `assets/icons/` — logo, symbol, favicons, Open Graph image
- `assets/email/` — images used in the MailerLite emails
- `email/` — source HTML of the two delivery emails (free 5, AI states)
- `downloads/` — `zeltrium-free-5.zip` and `zeltrium-ai-states-free.zip`, shown right after sign-up and linked in the emails
- `free/` — files for dev.to lessons

No cookies and nothing stored in the browser. Outside requests: the two free-pack forms post the
email address to MailerLite (double opt-in), and GoatCounter counts visits and clicks without
storing IP addresses. Contact: hello@zeltrium.com.
