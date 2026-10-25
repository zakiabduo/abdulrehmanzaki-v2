"use client";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { profile } from "@/data/content";
import { gsap, NO_REDUCE, useGSAP } from "@/lib/gsap";
import { useIdle } from "@/lib/hooks";
import { onPreloaded } from "@/lib/preload";
import { scrollToId } from "@/lib/scroll";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });
const nameLines = profile.name.split(" "); // Abdul / Rehman / Zaki

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const sceneReady = useIdle();

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(NO_REDUCE, () => {
      const intro = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } })
        .to(".hl-inner", { y: 0, duration: 1.4, stagger: 0.12 }, 0.1)
        .to(".hero-fade", { opacity: 1, duration: 0.9, stagger: 0.1 }, 0.7);
      const off = onPreloaded(() => intro.play());
      gsap.to(".hero-name", {
        yPercent: -14, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      return off;
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section id="top" ref={root} className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pb-8 pt-24 sm:pb-12">
      <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: sceneReady ? 1 : 0 }}>
        {sceneReady && <HeroScene />}
      </div>

      <div className="container-x pointer-events-none relative z-10">
        <ul className="pre-fade hero-fade max-w-md text-xl leading-snug sm:text-2xl">
          {profile.roles.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </div>

      <div className="container-x pointer-events-none relative z-10">
        <h1 className="hero-name display display-hero -ml-[0.04em]">
          <span className="sr-only">{profile.name}</span>
          {nameLines.map((w, i) => (
            <span key={w} className={`hl-mask ${i < nameLines.length - 1 ? "lg:mr-[0.2em] lg:inline-block" : ""}`} aria-hidden="true"><span className="hl-inner">{w}</span></span>
          ))}
        </h1>
        <div className="pre-fade hero-fade pointer-events-auto mt-8 flex flex-wrap gap-3">
          <a href={`/${profile.cv}`} download className="btn btn-solid">Download CV</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToId("contact"); }} className="btn btn-ghost">Get in touch</a>
        </div>
      </div>
    </section>
  );
}
