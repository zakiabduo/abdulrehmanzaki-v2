"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import SceneBoundary from "./SceneBoundary";
import { useCoarsePointer, useReducedMotion, useSceneColors } from "@/lib/hooks";

/**
 * One continuous particle space behind the whole page. Positions live in screen pixels, so the field
 * always fills the viewport. Deeper particles drift faster with scroll (parallax) and the cursor pushes them aside.
 */
const vertex = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uPx;
uniform vec2 uView;
uniform vec2 uPointer;
attribute float aSeed;
attribute float aDepth;
attribute float aSize;
varying float vAlpha;
varying float vAccent;
void main() {
  vec2 p = position.xy * uView;
  p += vec2(sin(uTime * 0.18 + aSeed * 6.2831), cos(uTime * 0.14 + aSeed * 12.566)) * 28.0 * (0.4 + aDepth);
  p.y += uScroll * (0.08 + 0.5 * aDepth);
  p.y = mod(p.y + uView.y * 0.5, uView.y) - uView.y * 0.5;
  vec2 d = p - uPointer;
  float dist = length(d);
  p += normalize(d + vec2(0.0001)) * smoothstep(190.0, 0.0, dist) * 48.0 * (0.4 + aDepth);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
  gl_PointSize = aSize * uPx * (0.7 + aDepth);
  vAlpha = (0.3 + 0.55 * aDepth) * (0.65 + 0.35 * sin(uTime * 0.9 + aSeed * 40.0));
  vAccent = step(0.93, fract(aSeed * 7.13));
}`;

const fragment = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uAccent;
varying float vAlpha;
varying float vAccent;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.18, d);
  if (a < 0.01) discard;
  gl_FragColor = vec4(mix(uInk, uAccent, vAccent), a * vAlpha * (1.0 + vAccent * 0.7));
  #include <colorspace_fragment>
}`;

function Particles({ reduced, coarse }: { reduced: boolean; coarse: boolean }) {
  const { ink, accent } = useSceneColors();
  const { size, viewport, invalidate } = useThree();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const scroll = useRef(0);
  const pointer = useRef(new THREE.Vector2(-9999, -9999));
  const target = useRef(new THREE.Vector2(-9999, -9999));

  const count = useMemo(() => {
    const byArea = Math.round((size.width * size.height) / (coarse ? 2600 : 1800));
    return Math.min(coarse ? 360 : 900, Math.max(200, byArea));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coarse]);

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3), seed = new Float32Array(count), depth = new Float32Array(count), sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = Math.random() - 0.5;
      pos[i * 3 + 1] = Math.random() - 0.5;
      seed[i] = Math.random();
      depth[i] = Math.pow(Math.random(), 1.6);
      sz[i] = 2.0 + Math.random() * 2.6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aDepth", new THREE.BufferAttribute(depth, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uScroll: { value: 0 }, uPx: { value: 1 },
    uView: { value: new THREE.Vector2(1, 1) }, uPointer: { value: new THREE.Vector2(-9999, -9999) },
    uInk: { value: new THREE.Color() }, uAccent: { value: new THREE.Color() },
  }), []);

  useEffect(() => {
    uniforms.uInk.value.set(ink);
    uniforms.uAccent.value.set(accent);
    invalidate();
  }, [ink, accent, uniforms, invalidate]);

  useEffect(() => {
    uniforms.uView.value.set(size.width, size.height);
    uniforms.uPx.value = viewport.dpr;
    invalidate();
  }, [size.width, size.height, viewport.dpr, uniforms, invalidate]);

  useEffect(() => {
    if (reduced || coarse) return;
    const move = (e: PointerEvent) => target.current.set(e.clientX - window.innerWidth / 2, window.innerHeight / 2 - e.clientY);
    const leave = () => target.current.set(-9999, -9999);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => { window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); };
  }, [reduced, coarse]);

  useFrame((state, dt) => {
    if (reduced) return;
    uniforms.uTime.value = state.clock.elapsedTime;
    scroll.current += (window.scrollY - scroll.current) * Math.min(1, dt * 6);
    uniforms.uScroll.value = scroll.current;
    if (target.current.x < -9000) pointer.current.copy(target.current);
    else if (pointer.current.x < -9000) pointer.current.copy(target.current);
    else pointer.current.lerp(target.current, Math.min(1, dt * 8));
    uniforms.uPointer.value.copy(pointer.current);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
    </points>
  );
}

export default function ParticleField() {
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();
  return (
    <SceneBoundary>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 1, near: 0.1, far: 100 }}
        frameloop={reduced ? "demand" : "always"}
        dpr={[1, coarse ? 1.5 : 2]}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      >
        <Particles reduced={reduced} coarse={coarse} />
      </Canvas>
    </SceneBoundary>
  );
}
