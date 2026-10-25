"use client";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { skillGroups } from "@/data/content";
import { useVisible } from "@/lib/hooks";
import { useSplitReveal } from "@/lib/useSplitReveal";
import Radar from "./Radar";
import Split from "./Split";

const SkillsOrbit = dynamic(() => import("./SkillsOrbit"), { ssr: false });

export default function Skills() {
  const root = useRef<HTMLElement>(null);
  const orbitWrap = useRef<HTMLDivElement>(null);
  const near = useVisible(orbitWrap, "400px");
  const loaded = useRef(false);
  if (near) loaded.current = true;
  useSplitReveal(root);

  return (
    <section id="skills" ref={root} className="section">
      <div className="container-x">
        <Split as="h2" text="Skills" className="display display-xl" />

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:items-center">
          <div ref={orbitWrap} className="relative mx-auto aspect-square w-full max-w-[40rem] lg:col-span-7">
            {loaded.current && <SkillsOrbit />}
            <p className="sr-only">Interactive 3D view of skills. The same skills are listed in text beside it.</p>
          </div>
          <div className="space-y-10 lg:col-span-5">
            {skillGroups.map((g) => (
              <div key={g.title} className="border-t border-line pt-4">
                <h3 className="display display-md">{g.title}</h3>
                <ul className="mt-3 text-muted">
                  {g.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
            <p className="text-sm text-muted">Drag the sphere to rotate it.</p>
          </div>
        </div>

        <div className="mt-28">
          <Radar />
        </div>
      </div>
    </section>
  );
}
