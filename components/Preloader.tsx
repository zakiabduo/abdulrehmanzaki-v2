"use client";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/content";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { markPreloaded } from "@/lib/preload";
import { lockScroll } from "@/lib/scroll";

/** A counter races to 100 on a glowing seam, then the screen splits open and the hero takes over. */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setGone(true); markPreloaded(); return; }
    const el = root.current;
    if (!el) return;
    let cancelled = false;
    lockScroll(true);
    const num = el.querySelector<HTMLElement>(".pl-num")!;
    const state = { v: 0 };

    const ctx = gsap.context(() => {
      const load = gsap.timeline()
        .to(".pl-name .hl-inner", { y: 0, duration: 1, stagger: 0.1, ease: "power4.out" }, 0.1)
        .to(".pl-bar", { scaleX: 1, duration: 1.9, ease: "power2.inOut" }, 0)
        .to(state, { v: 100, duration: 1.9, ease: "power2.inOut", onUpdate: () => { num.textContent = String(Math.round(state.v)).padStart(3, "0"); } }, 0);

      Promise.all([load.then(), document.fonts?.ready]).then(() => {
        if (cancelled) return;
        gsap.timeline({ onComplete: () => { lockScroll(false); setGone(true); ScrollTrigger.refresh(); } })
          .to(".pl-content", { opacity: 0, y: -24, duration: 0.45, ease: "power2.in" })
          .to(".pl-bar", { opacity: 0, duration: 0.3 }, "<")
          .to(".pl-top", { yPercent: -100, duration: 1.05, ease: "power4.inOut" }, 0.3)
          .to(".pl-bot", { yPercent: 100, duration: 1.05, ease: "power4.inOut" }, 0.3)
          .add(markPreloaded, 0.85);
      });
    }, el);

    return () => { cancelled = true; ctx.revert(); lockScroll(false); };
  }, []);

  if (gone) return null;
  const words = profile.name.split(" ");
  return (
    <div ref={root} className="preloader fixed inset-0 z-[100] text-ink" role="status" aria-label="Loading">
      <div className="pl-top absolute inset-x-0 top-0 h-1/2 bg-bg" />
      <div className="pl-bot absolute inset-x-0 bottom-0 h-1/2 bg-bg" />
      <div className="pl-bar absolute left-0 top-1/2 h-px w-full origin-left scale-x-0 bg-accent shadow-[0_0_18px_rgb(var(--accent))]" />
      <div aria-hidden="true" className="pl-content absolute inset-0 flex flex-col justify-between p-5 sm:p-8 lg:p-12">
        <p className="pl-name display display-lg">
          {words.map((w) => (
            <span key={w} className="hl-mask mr-[0.2em] inline-block"><span className="hl-inner">{w}</span></span>
          ))}
        </p>
        <p className="display display-xl self-end tabular-nums"><span className="pl-num">000</span></p>
      </div>
    </div>
  );
}
