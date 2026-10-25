"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import SceneBoundary from "./SceneBoundary";
import { useCoarsePointer, useReducedMotion, useSceneColors, useVisible } from "@/lib/hooks";

const LAYERS = [5, 8, 8, 6, 3];
const GAP = 2.2;

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildNetwork() {
  const r = rng(7);
  const nodes: THREE.Vector3[] = [];
  const layers: number[][] = [];
  LAYERS.forEach((n, li) => {
    const ids: number[] = [];
    for (let j = 0; j < n; j++) {
      nodes.push(new THREE.Vector3((li - (LAYERS.length - 1) / 2) * GAP, (j - (n - 1) / 2) * 0.85 + (r() - 0.5) * 0.35, (r() - 0.5) * 2.6));
      ids.push(nodes.length - 1);
    }
    layers.push(ids);
  });
  const edges: [number, number][] = [];
  for (let li = 0; li < layers.length - 1; li++) for (const a of layers[li]) for (const b of layers[li + 1]) edges.push([a, b]);
  return { nodes, edges };
}

function useDotTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d")!;
    x.beginPath(); x.arc(32, 32, 30, 0, Math.PI * 2); x.fillStyle = "#fff"; x.fill();
    return new THREE.CanvasTexture(c);
  }, []);
}

function Network({ reduced, coarse }: { reduced: boolean; coarse: boolean }) {
  const { ink, accent } = useSceneColors();
  const { viewport, invalidate } = useThree();
  const dot = useDotTexture();
  const group = useRef<THREE.Group>(null);
  const signalRef = useRef<THREE.Points>(null);
  const nodeMesh = useRef<THREE.InstancedMesh>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const net = useMemo(buildNetwork, []);
  const linePos = useMemo(() => {
    const a = new Float32Array(net.edges.length * 6);
    net.edges.forEach(([i, j], k) => { net.nodes[i].toArray(a, k * 6); net.nodes[j].toArray(a, k * 6 + 3); });
    return a;
  }, [net]);

  const signalCount = coarse ? 14 : 28;
  const signals = useMemo(() => {
    const r = rng(21);
    return Array.from({ length: signalCount }, () => ({ e: Math.floor(r() * net.edges.length), t: r(), s: 0.25 + r() * 0.35 }));
  }, [net, signalCount]);
  const signalPos = useMemo(() => new Float32Array(signalCount * 3), [signalCount]);


  useEffect(() => {
    const m = nodeMesh.current;
    if (!m) return;
    const dummy = new THREE.Object3D();
    const c = new THREE.Color();
    net.nodes.forEach((p, i) => {
      dummy.position.copy(p); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, c.set(i % 7 === 0 ? accent : ink));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    invalidate();
  }, [net, ink, accent, invalidate]);

  useEffect(() => {
    if (reduced) return;
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduced]);

  useFrame((state, dt) => {
    if (reduced) return;
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const scroll = Math.min(window.scrollY, 2400);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, -0.5 + Math.sin(t * 0.18) * 0.35 + scroll * 0.0013 + pointer.current.x * 0.35, 4, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.12 - pointer.current.y * 0.18, 4, dt);

    signals.forEach((s, i) => {
      s.t += dt * s.s;
      if (s.t > 1) { s.t = 0; s.e = Math.floor(Math.random() * net.edges.length); }
      const [a, b] = net.edges[s.e];
      const A = net.nodes[a], B = net.nodes[b];
      signalPos[i * 3] = A.x + (B.x - A.x) * s.t;
      signalPos[i * 3 + 1] = A.y + (B.y - A.y) * s.t;
      signalPos[i * 3 + 2] = A.z + (B.z - A.z) * s.t;
    });
    const attr = signalRef.current?.geometry.attributes.position;
    if (attr) attr.needsUpdate = true;
  });

  const narrow = viewport.width < 9;
  const scale = narrow ? viewport.width / 10.5 : Math.min(0.85, viewport.width / 17);
  const pos: [number, number, number] = narrow ? [0, viewport.height * 0.1, 0] : [viewport.width * 0.17, viewport.height * 0.16, 0];

  return (
    <>
      <group ref={group} position={pos} scale={scale} rotation={[0.12, -0.5, 0]}>
        <lineSegments>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[linePos, 3]} /></bufferGeometry>
          <lineBasicMaterial color={ink} transparent opacity={0.13} />
        </lineSegments>
        <instancedMesh ref={nodeMesh} args={[undefined, undefined, net.nodes.length]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshBasicMaterial />
        </instancedMesh>
        <points ref={signalRef}>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[signalPos, 3]} /></bufferGeometry>
          <pointsMaterial color={accent} map={dot} alphaTest={0.5} size={0.17} sizeAttenuation transparent depthWrite={false} />
        </points>
      </group>
    </>
  );
}

export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const visible = useVisible(wrap);
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();

  return (
    <div ref={wrap} aria-hidden="true" className="absolute inset-0">
      <SceneBoundary>
        <Canvas
          frameloop={visible && !reduced ? "always" : "demand"}
          dpr={[1, coarse ? 1.5 : 1.75]}
          camera={{ position: [0, 0, 9], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <Network reduced={reduced} coarse={coarse} />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
