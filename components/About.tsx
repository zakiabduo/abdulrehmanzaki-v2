"use client";
import Image from "next/image";
import { useRef } from "react";
import { profile, stats } from "@/data/content";
import { gsap, NO_REDUCE, useGSAP } from "@/lib/gsap";
import { useSplitReveal } from "@/lib/useSplitReveal";
import Split from "./Split";

export default function About() {
  const root = useRef<HTMLElement>(null);
  useSplitReveal(root);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(NO_REDUCE, () => {
      gsap.to(".about-photo", {
        clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "power4.inOut",
        scrollTrigger: { trigger: ".about-photo", start: "top 85%", once: true },
      });
      gsap.utils.toArray<HTMLElement>(".counter").forEach((el) => {
        const target = Number(el.dataset.value);
        const state = { v: 0 };
        el.textContent = "0";
        gsap.to(state, {
          v: target, duration: 1.8, ease: "power2.out",
          onUpdate: () => { el.textContent = String(Math.round(state.v)); },
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section id="about" ref={root} className="section">
      <div className="container-x">
        <Split as="h2" text="About" className="display display-xl" />
        <Split as="p" mode="fade" text={profile.bio} className="lead mt-12 max-w-[26ch] sm:max-w-[34ch] lg:max-w-[44ch]" />

        <div className="mt-20 grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="about-photo clip-init relative aspect-[4/5] overflow-hidden bg-line">
              <Image
                src="/me.jpg.png" alt={`Portrait of ${profile.name}`} fill priority={false}
                sizes="(min-width: 1025px) 30vw, 90vw"
                className="object-cover grayscale transition duration-700 hover:grayscale-0"
              />
            </div>
          </div>
          <dl className="grid content-end gap-10 sm:grid-cols-3 lg:col-span-8">
            {stats.map((s) => (
              <div key={s.label} className="border-t border-line pt-5">
                <dd className="display display-xl tabular-nums"><span className="counter" data-value={s.value}>{s.value}</span></dd>
                <dt className="mt-3 max-w-[16ch] text-base text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
