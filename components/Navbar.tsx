"use client";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { profile, sections } from "@/data/content";
import { gsap, NO_REDUCE, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { onPreloaded } from "@/lib/preload";
import { scramble } from "@/lib/scramble";
import { lockScroll, scrollToId } from "@/lib/scroll";

const nameParts = profile.name.split(" ");
const hidden = { visibility: "hidden", clipPath: "circle(0px at 100% 0px)" } as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const { resolvedTheme, setTheme } = useTheme();

  const bar = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const pill = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const themeIcon = useRef<HTMLSpanElement>(null);
  const firstMenuRun = useRef(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    const resize = () => setTick((t) => t + 1);
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", resize); };
  }, []);

  // Progress line, entrance sequence and scroll-spy
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(NO_REDUCE, () => {
      gsap.to(bar.current, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });
      return onPreloaded(() => {
        gsap.fromTo(shell.current, { y: -32, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: "power4.out" });
        links.current.forEach((a, i) => {
          const t = a?.querySelector<HTMLElement>("[data-text]");
          if (t) gsap.delayedCall(0.35 + i * 0.09, () => scramble(t, t.dataset.text!, 0.8));
        });
      });
    });
    const triggers = [{ id: "top", val: null as string | null }, ...sections.map((s) => ({ id: s.id, val: s.id as string | null }))].map(({ id, val }) =>
      ScrollTrigger.create({ trigger: `#${id}`, start: "top 55%", end: "bottom 55%", onToggle: (self) => { if (self.isActive) setActive(val); } }),
    );
    return () => { mm.revert(); triggers.forEach((t) => t.kill()); };
  });

  // Glowing marker glides to the active section
  useEffect(() => {
    const m = marker.current;
    if (!m) return;
    const i = sections.findIndex((s) => s.id === active);
    const a = links.current[i];
    if (i < 0 || !a) { gsap.to(m, { opacity: 0, duration: 0.3 }); return; }
    const to = { x: a.offsetLeft + 12, width: a.offsetWidth - 24 };
    if (Number(gsap.getProperty(m, "opacity")) < 0.05) gsap.set(m, to);
    gsap.to(m, { ...to, opacity: 1, duration: 0.7, ease: "power3.out" });
  }, [active, tick]);

  // Mobile menu: circular reveal from the button, links rise in
  useEffect(() => {
    lockScroll(open);
    const el = menu.current;
    if (!el) return;
    if (firstMenuRun.current) { firstMenuRun.current = false; return; }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const x = window.innerWidth - 40, r = Math.hypot(window.innerWidth, window.innerHeight) + 60;
    if (open) {
      el.style.visibility = "visible";
      if (reduced) { el.style.clipPath = "none"; return; }
      gsap.fromTo(el, { clipPath: `circle(0px at ${x}px 36px)` }, { clipPath: `circle(${r}px at ${x}px 36px)`, duration: 0.9, ease: "power4.inOut" });
      gsap.fromTo(el.querySelectorAll("li a"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.07, delay: 0.3, ease: "power4.out" });
    } else if (reduced) {
      el.style.visibility = "hidden";
    } else {
      gsap.to(el, { clipPath: `circle(0px at ${x}px 36px)`, duration: 0.6, ease: "power4.inOut", onComplete: () => { el.style.visibility = "hidden"; } });
    }
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const wasOpen = open;
    setOpen(false);
    setTimeout(() => scrollToId(id), wasOpen ? 450 : 0);
  };

  const hover = (i: number) => {
    const a = links.current[i], p = pill.current;
    if (!a || !p) return;
    const to = { x: a.offsetLeft, width: a.offsetWidth };
    if (Number(gsap.getProperty(p, "opacity")) < 0.05) gsap.set(p, to);
    gsap.to(p, { ...to, opacity: 1, duration: 0.45, ease: "power3.out" });
    const t = a.querySelector<HTMLElement>("[data-text]");
    if (t) scramble(t, t.dataset.text!, 0.4);
  };

  const dark = resolvedTheme === "dark";
  const toggleTheme = () => {
    if (themeIcon.current) gsap.fromTo(themeIcon.current, { rotate: 0, scale: 0.6 }, { rotate: 180, scale: 1, duration: 0.6, ease: "back.out(2)" });
    setTheme(dark ? "light" : "dark");
  };

  return (
    <>
      <div ref={bar} aria-hidden className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left scale-x-0 bg-accent shadow-[0_0_10px_rgb(var(--accent))]" />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4">
        <div ref={shell} data-scrolled={scrolled} onTransitionEnd={(e) => e.propertyName === "width" && setTick((t) => t + 1)} className="nav-shell pre-fade pointer-events-auto">
          <a href="#top" onClick={go("top")} aria-label={profile.name} className="sans flex text-base font-semibold">
            {nameParts.map((w, i) => (
              <span key={w} aria-hidden="true">
                <span>{w[0]}</span>
                <span className="logo-rest">{w.slice(1)}{i < nameParts.length - 1 ? " " : ""}</span>
              </span>
            ))}
          </a>

          <nav aria-label="Primary" className="relative hidden items-center lg:flex" onMouseLeave={() => pill.current && gsap.to(pill.current, { opacity: 0, duration: 0.3 })}>
            <div ref={pill} aria-hidden className="pointer-events-none absolute left-0 top-1/2 h-9 w-0 -translate-y-1/2 rounded-full border border-ink/25 bg-ink/[0.07] opacity-0" />
            <div ref={marker} aria-hidden className="pointer-events-none absolute -bottom-2 left-0 h-[2px] w-0 rounded-full bg-accent opacity-0 shadow-[0_0_12px_rgb(var(--accent))]" />
            {sections.map((s, i) => (
              <a
                key={s.id} ref={(el) => { links.current[i] = el; }} href={`#${s.id}`} onClick={go(s.id)} onMouseEnter={() => hover(i)} onFocus={() => hover(i)}
                aria-current={active === s.id ? "true" : undefined} className="sans relative px-3 py-2 text-sm"
              >
                <span data-text={s.label}>{s.label}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button type="button" aria-label={mounted ? `Switch to ${dark ? "light" : "dark"} theme` : "Switch theme"} onClick={toggleTheme} className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/10">
              <span ref={themeIcon} className="grid place-items-center">{mounted && dark ? <Sun size={18} /> : <Moon size={18} />}</span>
            </button>
            <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)} className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/10 lg:hidden">
              <span className="relative block h-3 w-6">
                <span className={`absolute left-0 h-px w-full bg-current transition-all duration-500 ${open ? "top-1/2 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-full bg-current transition-all duration-500 ${open ? "top-1/2 -rotate-45" : "top-full"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div ref={menu} id="mobile-menu" style={hidden} className="fixed inset-0 z-40 flex flex-col justify-end bg-bg px-5 pb-12 pt-24 text-ink lg:hidden">
        <nav aria-label="Mobile">
          <ul>
            {sections.map((s) => (
              <li key={s.id} className="overflow-hidden border-t border-line">
                <a href={`#${s.id}`} onClick={go(s.id)} className="display display-lg block py-3">{s.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
