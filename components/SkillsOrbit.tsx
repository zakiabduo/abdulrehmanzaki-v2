"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import SceneBoundary from "./SceneBoundary";
import { orbitSkills } from "@/data/content";
import { useReducedMotion, useSceneColors, useVisible } from "@/lib/hooks";

const R = 2.4;

function fibonacciSphere(n: number): [number, number, number][] {
  const phi = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = phi * i;
    return [Math.cos(th) * r * R, y * R, Math.sin(th) * r * R];
  });
}

function SkillNode({ pos, label }: { pos: [number, number, number]; label: string }) {
  const { ink, accent } = useSceneColors();
  const g = useRef<THREE.Group>(null);
  const el = useRef<HTMLDivElement>(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  const [hover, setHover] = useState(false);

  useFrame(() => {
    if (!g.current || !el.current) return;
    g.current.getWorldPosition(v);
    el.current.style.opacity = String(0.22 + 0.78 * ((v.z + R) / (2 * R)));
  });

  return (
    <group ref={g} position={pos}>
      <mesh>
        <sphereGeometry args={[hover ? 0.12 : 0.075, 16, 16]} />
        <meshBasicMaterial color={hover ? accent : ink} />
      </mesh>
      <mesh onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
        <sphereGeometry args={[0.38, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div ref={el} className="orbit-label" data-active={hover}>{label}</div>
      </Html>
    </group>
  );
}

/** Drag to spin with inertia. Vertical swipes still scroll the page on touch devices. */
function Rotator({ reduced, children }: { reduced: boolean; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const { gl, invalidate } = useThree();
  const s = useRef({ drag: false, x: 0, y: 0, t: 0, vy: 0 });
  const base = reduced ? 0 : 0.28;

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "pan-y";
    el.style.cursor = "grab";
    const down = (e: PointerEvent) => { Object.assign(s.current, { drag: true, x: e.clientX, y: e.clientY, t: e.timeStamp }); el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; };
    const move = (e: PointerEvent) => {
      const st = s.current;
      if (!st.drag || !g.current) return;
      const dx = e.clientX - st.x, dy = e.clientY - st.y, dt = Math.max((e.timeStamp - st.t) / 1000, 0.008);
      g.current.rotation.y += dx * 0.007;
      g.current.rotation.x = THREE.MathUtils.clamp(g.current.rotation.x + dy * 0.005, -0.9, 0.9);
      st.vy = THREE.MathUtils.clamp((dx * 0.007) / dt, -6, 6);
      st.x = e.clientX; st.y = e.clientY; st.t = e.timeStamp;
      invalidate();
    };
    const up = () => { s.current.drag = false; el.style.cursor = "grab"; };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
    };
  }, [gl, invalidate]);

  useFrame((_, dt) => {
    const st = s.current;
    if (!g.current || st.drag) return;
    st.vy += (base - st.vy) * Math.min(1, dt * 1.5);
    g.current.rotation.y += st.vy * dt;
    if (reduced && Math.abs(st.vy) > 0.01) invalidate();
  });

  return <group ref={g} rotation={[0.25, 0, 0]}>{children}</group>;
}

function Orbit({ reduced }: { reduced: boolean }) {
  const { ink } = useSceneColors();
  const points = useMemo(() => fibonacciSphere(orbitSkills.length), []);
  return (
    <Rotator reduced={reduced}>
      <mesh>
        <icosahedronGeometry args={[R * 0.985, 2]} />
        <meshBasicMaterial color={ink} wireframe transparent opacity={0.1} />
      </mesh>
      {[0, Math.PI / 3, -Math.PI / 3].map((tilt, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + tilt, 0, 0]}>
          <torusGeometry args={[R * 1.12, 0.004, 8, 128]} />
          <meshBasicMaterial color={ink} transparent opacity={0.35} />
        </mesh>
      ))}
      {points.map((p, i) => <SkillNode key={orbitSkills[i]} pos={p} label={orbitSkills[i]} />)}
    </Rotator>
  );
}

export default function SkillsOrbit() {
  const wrap = useRef<HTMLDivElement>(null);
  const visible = useVisible(wrap);
  const reduced = useReducedMotion();
  return (
    <div ref={wrap} className="h-full w-full">
      <SceneBoundary fallback={<p className="p-6 text-muted">Interactive skills view needs WebGL. The full skills list is next to it.</p>}>
        <Canvas
          frameloop={visible && !reduced ? "always" : "demand"}
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 7.4], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Orbit reduced={reduced} />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
