"use client";
import { useRef } from "react";
import { radar } from "@/data/content";
import { gsap, NO_REDUCE, useGSAP } from "@/lib/gsap";

const SIZE = 440, C = SIZE / 2, RAD = 140, N = radar.length, MAX = 5;
const point = (i: number, v: number, p = 1): [number, number] => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
  const r = RAD * (v / MAX) * p;
  return [C + Math.cos(a) * r, C + Math.sin(a) * r];
};
const poly = (p: number) => radar.map((d, i) => point(i, d.value, p).join(",")).join(" ");

export default function Radar() {
  const root = useRef<HTMLDivElement>(null);
  const shape = useRef<SVGPolygonElement>(null);
  const dots = useRef<(SVGCircleElement | null)[]>([]);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(NO_REDUCE, () => {
      const state = { p: 0 };
      const render = () => {
        shape.current?.setAttribute("points", poly(state.p));
        dots.current.forEach((c, i) => { const [x, y] = point(i, radar[i].value, state.p); c?.setAttribute("cx", String(x)); c?.setAttribute("cy", String(y)); });
      };
      gsap.fromTo(state, { p: 0 }, {
        p: 1, duration: 1.6, ease: "power3.out", onUpdate: render, onStart: render,
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });
      render();
      gsap.from(".radar-row", { opacity: 0, x: -12, stagger: 0.08, duration: 0.6, scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
    });
    return () => mm.revert();
  }, { scope: root });

  const summary = radar.map((d) => `${d.axis} ${d.value} of ${MAX}`).join(", ");

  return (
    <div ref={root} className="grid items-center gap-10 lg:grid-cols-2">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Self-assessed skill radar. ${summary}.`} className="mx-auto w-full max-w-[34rem] overflow-visible">
        {[1, 2, 3, 4, 5].map((ring) => (
          <polygon key={ring} points={radar.map((_, i) => point(i, ring).join(",")).join(" ")} fill="none" stroke="currentColor" strokeOpacity={ring === MAX ? 0.4 : 0.14} />
        ))}
        {radar.map((_, i) => { const [x, y] = point(i, MAX); return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="currentColor" strokeOpacity={0.14} />; })}
        <polygon ref={shape} points={poly(1)} fill="rgb(var(--accent) / 0.16)" stroke="rgb(var(--accent))" strokeWidth={2} strokeLinejoin="round" />
        {radar.map((d, i) => { const [x, y] = point(i, d.value); return <circle key={d.axis} ref={(el) => { dots.current[i] = el; }} cx={x} cy={y} r={4} fill="rgb(var(--accent))" />; })}
        {radar.map((d, i) => {
          const [x, y] = point(i, MAX + 0.95);
          const anchor = Math.abs(x - C) < 6 ? "middle" : x > C ? "start" : "end";
          return <text key={d.axis} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fill="currentColor" className="font-display" style={{ fontSize: 15, fontWeight: 500 }}>{d.axis}</text>;
        })}
      </svg>
      <div>
        <p className="text-muted">Self-assessed, out of {MAX}.</p>
        <ul className="mt-6">
          {radar.map((d) => (
            <li key={d.axis} className="radar-row flex items-baseline justify-between border-t border-line py-3">
              <span className="sans text-lg">{d.axis}</span>
              <span className="display display-md tabular-nums">{d.value}<span className="text-muted"> / {MAX}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
