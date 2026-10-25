"use client";
import { useRef } from "react";
import { timeline } from "@/data/content";
import { gsap, NO_REDUCE, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useSplitReveal } from "@/lib/useSplitReveal";
import Split from "./Split";

export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  useSplitReveal(root);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(NO_REDUCE, () => {
      gsap.fromTo(".tl-line", { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: track.current, start: "top 70%", end: "bottom 60%", scrub: true },
      });
      gsap.utils.toArray<HTMLElement>(".tl-item").forEach((item) => {
        ScrollTrigger.create({ trigger: item, start: "top 65%", toggleClass: { targets: item, className: "is-on" } });
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section id="experience" ref={root} className="section">
      <div className="container-x">
        <Split as="h2" text="Experience" className="display display-xl" />
        <ol ref={track} className="relative mt-16 ml-1.5">
          <span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-line" />
          <span aria-hidden className="tl-line absolute bottom-0 left-0 top-0 w-px origin-top bg-ink" />
          {timeline.map((t) => (
            <li key={t.title} className="tl-item group relative grid gap-3 py-10 pl-8 lg:grid-cols-12 lg:gap-8 lg:pl-16">
              <span aria-hidden className="absolute -left-[5px] top-[3.15rem] h-[11px] w-[11px] rounded-full border border-ink bg-bg transition-colors duration-300 group-[.is-on]:bg-ink" />
              <p className="display display-lg lg:col-span-5">{t.period}</p>
              <div className="lg:col-span-7">
                <h3 className="sans text-2xl sm:text-3xl">{t.title}</h3>
                <p className="mt-1 text-muted">{t.place}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
