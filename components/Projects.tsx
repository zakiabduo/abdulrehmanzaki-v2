"use client";
import Image from "next/image";
import { useRef } from "react";
import { projects } from "@/data/content";
import { gsap, NO_REDUCE, useGSAP } from "@/lib/gsap";
import { useSplitReveal } from "@/lib/useSplitReveal";
import Split from "./Split";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  useSplitReveal(root);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(NO_REDUCE, () => {
      gsap.utils.toArray<HTMLElement>(".proj").forEach((p) => {
        gsap.to(p.querySelector(".proj-media"), {
          clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "power4.inOut",
          scrollTrigger: { trigger: p, start: "top 75%", once: true },
        });
        gsap.fromTo(p.querySelector(".proj-img"), { yPercent: -7 }, {
          yPercent: 7, ease: "none",
          scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section id="projects" ref={root} className="section">
      <div className="container-x">
        <Split as="h2" text="Selected projects" className="display display-xl max-w-[12ch]" />
        <div className="mt-16">
          {projects.map((p, i) => (
            <article key={p.title} className="proj grid gap-8 border-t border-line py-14 lg:grid-cols-12 lg:gap-12 lg:py-20">
              <div className={`lg:col-span-7 ${i % 2 ? "lg:order-2" : ""}`}>
                <div className="proj-media clip-init relative aspect-[16/10] overflow-hidden bg-line">
                  {p.image && (
                    <div className="proj-img absolute inset-x-0 -inset-y-[8%]">
                      <Image
                        src={p.image} alt={`${p.title} – project screenshot`} fill
                        sizes="(min-width: 1025px) 55vw, 95vw"
                        className="object-cover grayscale transition duration-700 hover:grayscale-0"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className={`lg:col-span-5 ${i % 2 ? "lg:order-1" : ""}`}>
                <div className="lg:sticky lg:top-28">
                  <p className="sans text-sm text-muted">{p.category}</p>
                  <h3 className="display mt-3 text-[clamp(2.5rem,4.6vw,4.75rem)]">{p.title}</h3>
                  <p className="mt-6 max-w-[52ch]">{p.description}</p>
                  <ul className="sans mt-6 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                    {p.tags.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                  {(p.live || p.github) && (
                    <div className="sans mt-8 flex gap-6 text-base">
                      {p.live && <a href={p.live} {...ext} className="link-u">Live site<span className="sr-only"> (opens in a new tab)</span></a>}
                      {p.github && <a href={p.github} {...ext} className="link-u">Source code<span className="sr-only"> (opens in a new tab)</span></a>}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
