import { gsap } from "./gsap";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\[]{}=+*#%&";
const running = new WeakMap<HTMLElement, gsap.core.Tween>();

/** Decodes `text` into `el` letter by letter, like a signal locking on. Width is held steady while it runs. */
export function scramble(el: HTMLElement, text: string, duration = 0.6) {
  running.get(el)?.kill();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = text; return; }
  const prevDisplay = el.style.display;
  el.style.display = "inline-block";
  el.style.width = `${el.offsetWidth}px`;
  el.style.whiteSpace = "nowrap";
  const state = { p: 0 };
  const finish = () => { el.textContent = text; el.style.width = ""; el.style.display = prevDisplay; el.style.whiteSpace = ""; };
  running.set(el, gsap.to(state, {
    p: 1, duration, ease: "none",
    onUpdate() {
      const done = Math.floor(state.p * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) out += i < done || text[i] === " " ? text[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      el.textContent = out;
    },
    onComplete: finish,
    onInterrupt: finish,
  }));
}
