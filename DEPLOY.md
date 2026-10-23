# Deploy

## Preview locally
Animations load from `assets/lottie/*.dat`, which browsers block on `file://`.
Run a local server in the repo folder and open http://localhost:8000:

    python3 -m http.server 8000

GoatCounter skips localhost, so local previews are not counted.

## Publish
GitHub Pages serves the `main` branch. Changes go through a pull request; Roman merges it
and the site updates within a minute or two at https://zeltrium.com.

## Free packs (MailerLite)
Both forms post to MailerLite; the site shows the download right after the form is sent.
MailerLite's own double opt-in email (not customizable on the free plan) confirms the address,
then the automation sends the delivery email from hello@zeltrium.com (opens are not tracked).

| Pack | Form id in `index.html` | MailerLite form → group | Automation | Email source | Download |
|---|---|---|---|---|---|
| Free 5 | `free-form` → 200318522151143170 | Zeltrium free pack | Zeltrium free pack | `email/free-5-delivery.html` | `downloads/zeltrium-free-5.zip` |
| AI states | `ai-form` → 202105914383140548 | AI states free | Zeltrium AI states | `email/ai-states-delivery.html` | `downloads/zeltrium-ai-states-free.zip` |

The old `downloads/ui-microinteractions-free-pack.zip` stays so links in emails sent before
the switch keep working.

## Analytics (GoatCounter)
`assets/js/goatcounter-count.js` is loaded on every page and reports to
https://zeltrium.goatcounter.com. Click events come from `data-goatcounter-click`
(downloads, Gumroad, brief, Upwork); `script.js` adds `free-signup` / `ai-signup`.
If you change what is collected, update section 4 of `privacy.html`.

## Changing animations
Replace a file in the pack, then rebuild `assets/lottie/preview.dat` (or `ai.dat` for the
AI states): brand-recolored, XOR-encoded with the key in script.js, base64.
Segments are played with enterFrame and end with `goToAndStop` on the exact marker frame:
lottie's `playSegments` stops one frame short.
