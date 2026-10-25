"use client";
import dynamic from "next/dynamic";
import { useIdle } from "@/lib/hooks";

const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false });

/** Fixed full-screen particle space behind every section, so the site reads as one continuous screen. */
export default function Background() {
  const ready = useIdle(800);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-[1600ms]" style={{ opacity: ready ? 1 : 0 }}>
      {ready && <ParticleField />}
    </div>
  );
}
