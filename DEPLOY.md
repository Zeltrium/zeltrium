# Deploy

## Preview locally
Animations load from `assets/lottie/preview.dat`, which browsers block on `file://`.
Run a local server in the repo folder and open http://localhost:8000:

    python3 -m http.server 8000

## Publish
GitHub Pages serves the `main` branch. Merge a pull request into `main` and the
site updates within a minute or two at https://zeltrium.com.

## Free pack email (MailerLite)
- Form: `free-form` in `index.html` posts to MailerLite form 200318522151143170.
- The site shows the download right after the form is sent. MailerLite's own
  double opt-in email (not customizable on the free plan) confirms the address.
- After confirmation, the automation sends `email/free-5-delivery.html` with the
  link https://zeltrium.com/downloads/zeltrium-free-5.zip and the upsell.
- The old `downloads/ui-microinteractions-free-pack.zip` stays so links in
  emails sent before the switch keep working. Delete it in a month or two.

## Changing animations
Replace a file in the pack, then rebuild `assets/lottie/preview.dat`
(brand-recolored, XOR-encoded with the key in script.js, base64).
