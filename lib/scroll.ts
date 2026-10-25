import type Lenis from "lenis";

let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => { instance = l; };

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) instance.scrollTo(el, { offset: -16, duration: 1.4 });
  else el.scrollIntoView({ behavior: "auto" });
  history.replaceState(null, "", id === "top" ? location.pathname : `#${id}`);
}

export function lockScroll(locked: boolean) {
  if (locked) instance?.stop(); else instance?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
