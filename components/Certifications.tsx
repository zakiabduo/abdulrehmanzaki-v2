"use client";
import { useRef } from "react";
import { certifications } from "@/data/content";
import { useSplitReveal } from "@/lib/useSplitReveal";
import Split from "./Split";

export default function Certifications() {
  const root = useRef<HTMLElement>(null);
  useSplitReveal(root);
  return (
    <section id="certifications" ref={root} className="section">
      <div className="container-x">
        <Split as="h2" text="Certificates" className="display display-xl" />
        <ul className="mt-16 border-b border-line">
          {certifications.map((c) => (
            <li key={c.href} className="border-t border-line">
              <a
                href={c.href} target="_blank" rel="noopener noreferrer"
                className="group grid gap-1 px-2 py-6 transition-colors duration-200 hover:bg-ink hover:text-bg focus-visible:bg-ink focus-visible:text-bg sm:grid-cols-12 sm:gap-8 sm:px-4"
              >
                <span className="sans text-xl sm:col-span-8 sm:text-2xl">{c.title}</span>
                <span className="text-muted transition-colors group-hover:text-bg/70 group-focus-visible:text-bg/70 sm:col-span-4 sm:text-right">
                  {c.issuer}<span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
