"use client";
import type { RefObject } from "react";
import { gsap, NO_REDUCE, useGSAP } from "./gsap";

/** Reveals every <Split> inside `scope`: masked words rise once; fade-mode words light up with scroll. */
export function useSplitReveal(scope: RefObject<HTMLElement>) {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(NO_REDUCE, () => {
      gsap.utils.toArray<HTMLElement>('.split[data-split="mask"]', scope.current).forEach((el) => {
        gsap.to(el.querySelectorAll(".sw-inner"), {
          y: 0, duration: 1.1, ease: "power4.out", stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>('.split[data-split="fade"]', scope.current).forEach((el) => {
        gsap.to(el.querySelectorAll(".sw-fade"), {
          opacity: 1, ease: "none", stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true },
        });
      });
    });
    return () => mm.revert();
  }, { scope });
}
