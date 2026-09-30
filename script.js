document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- lottie playback: hold-then-replay / toggle back-and-forth ---------- */
/* Native `loop` restarts instantly on short animations → looks like a strobe.
   Instead: play once, wait `data-hold` ms, then either replay from the start
   (js-loop) or reverse direction (js-toggle) so it flips back and forth. */

function wirePlayer(player, mode) {
  const hold = parseInt(player.dataset.hold || '1000', 10);
  let direction = 1;

  const start = () => {
    player.setDirection(1);
    player.stop();
    player.play();
  };

  player.addEventListener('ready', start);

  player.addEventListener('complete', () => {
    setTimeout(() => {
      if (mode === 'toggle') {
        direction *= -1;
        player.setDirection(direction);
        player.play();
      } else {
        player.setDirection(1);
        player.seek(0);
        player.play();
      }
    }, hold);
  });
}

document.querySelectorAll('lottie-player.js-loop').forEach((p) => wirePlayer(p, 'loop'));
document.querySelectorAll('lottie-player.js-toggle').forEach((p) => wirePlayer(p, 'toggle'));

/* ---------- free-pack signup form ---------- */

const form = document.getElementById('pack-form');
const formState = document.getElementById('pack-form-state');
const successState = document.getElementById('pack-success-state');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector('button');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      formState.classList.add('hidden');
      successState.classList.remove('hidden');
    } else {
      throw new Error('Form submission failed');
    }
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send me the pack';
    alert("Something went wrong — please try again, or email us directly.");
  }
});
