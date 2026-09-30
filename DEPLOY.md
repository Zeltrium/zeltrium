# Deploy checklist

## 0. Local preview (important!)
Opening `index.html` by double-clicking shows `file:///...` in the address bar.
At that point the browser **blocks loading local JSON files** (a CORS
protection), so the animations won't load and you'll see a warning icon
instead. That's not a bug in the markup or a filename issue — it's just how
`file://` behaves.

To preview it properly, run a local server:
- **VS Code**: install the "Live Server" extension, open the `landing-page`
  folder, right-click `index.html` → "Open with Live Server".
- **Python**: in a terminal, inside `landing-page`, run `python -m http.server 8000`
  and open `http://localhost:8000`.

Once it's live on GitHub Pages this stops mattering — the site runs over
`https://`, not `file://`.

## 1. Already done ✓
- Formspree endpoint: `https://formspree.io/f/mljdzvzl`
- Gumroad link: `https://zeltrium.gumroad.com/l/lottie-ui-micro-interactions`
- Domain: `zeltrium.com` (in `CNAME`, `og:url`, `og:image`, `twitter:image`)
- Fonts + Lottie player self-hosted (no third-party requests at all)
- 5 free-pack animations wired into the page (`assets/lottie/*.json`)
- Downloadable pack built: `downloads/ui-microinteractions-free-pack.zip`
  (JSON + .lottie for all 5, README, license — no attribution required)
- Real logo in header, footer, favicon, apple-touch-icon and the OG/share image
- `imprint.html`, `privacy.html`, `contact.html` built from your text and
  linked in the footer on every page
- Honeypot spam field on the signup form, `aria-hidden` on decorative icons

## 2. Still to do
- Nothing content-wise — this is ready to push as-is.
- If you ever want automated email delivery instead of the current
  "download button appears after signup" flow, swap the Formspree `action`
  for a real ESP (ConvertKit/MailerLite) later — no other changes needed.

## 3. Push to GitHub Pages
```bash
git init
git add .
git commit -m "Landing page for UI micro-interactions free pack"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
Then in the repo: **Settings → Pages → Source → main branch → / (root)**.

## 4. Point your domain at it
In `zeltrium.com`'s DNS settings, add:
- An `A` record pointing `@` to GitHub Pages' IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153), and
- A `CNAME` record for `www` pointing to `YOUR_USERNAME.github.io`

GitHub Pages will pick up the `CNAME` file already in this repo automatically once DNS propagates (can take up to a few hours).

## 5. Test before sharing
- Submit the form yourself with a real email — confirm it lands in Formspree and the download button appears.
- Click the download button — confirm the zip actually downloads and unzips cleanly.
- Click the Gumroad button — confirm it goes to the right product.
- Check `imprint.html`, `privacy.html`, `contact.html` — confirm the footer links work from every page, and the mailto button opens mail correctly.
- Check on mobile — this is going in a bio link, most traffic will be phones.
