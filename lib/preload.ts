/** Tiny signal so the hero and navbar can wait for the preloader curtain before they animate in. */
const EVT = "preloader:done";
let done = false;

export function markPreloaded() {
  if (done) return;
  done = true;
  window.dispatchEvent(new Event(EVT));
}

export function onPreloaded(cb: () => void) {
  if (done) { cb(); return () => {}; }
  window.addEventListener(EVT, cb, { once: true });
  return () => window.removeEventListener(EVT, cb);
}
