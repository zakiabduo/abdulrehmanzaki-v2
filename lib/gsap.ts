import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Run motion only when the visitor has not asked for reduced motion. */
export const NO_REDUCE = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };
