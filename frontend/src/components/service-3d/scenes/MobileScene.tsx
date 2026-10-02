"use client";

import { useRef } from "react";
import type * as THREE from "three";
import { PALETTE } from "../serviceConfig";
import { useIdleFrame } from "../sceneSettings";
import { Slab, TextLine, Dot, GroundShadow, Halo, fadeGroup, pulseWindow, smooth } from "../parts";

// MOBILE — a navy handset with a working-app screen (balance card, quick
// actions, activity list, tab bar), swinging slowly on its Y axis while
// three app icons orbit it and a notification slides in from the edge.

const SCREEN = 0.062;
const ORBIT = [
  { y: 0.55, finish: "accent" as const, color: PALETTE.royal },
  { y: -0.15, finish: "glass" as const, color: PALETTE.white },
  { y: -0.7, finish: "dark" as const, color: PALETTE.navy },
];

export default function MobileScene() {
  const phone = useRef<THREE.Group>(null!);
  const icons = useRef<(THREE.Group | null)[]>([]);
  const notice = useRef<THREE.Group>(null!);

  useIdleFrame((t) => {
    phone.current.rotation.y = -0.22 + Math.sin(t * 0.38) * 0.42;
    phone.current.rotation.x = 0.06 + Math.sin(t * 0.3) * 0.03;
    phone.current.position.y = Math.sin(t * 0.8) * 0.06;

    icons.current.forEach((icon, i) => {
      if (!icon) return;
      const a = t * 0.32 + (i * Math.PI * 2) / ORBIT.length;
      icon.position.set(Math.cos(a) * 1.45, ORBIT[i].y + Math.sin(t * 0.9 + i) * 0.05, Math.sin(a) * 0.65);
      icon.rotation.y = Math.sin(a) * 0.3;
    });

    const s = smooth(pulseWindow(t, 7, 1.5, 0.6));
    notice.current.position.x = 0.95 - 0.38 * s;
    fadeGroup(notice.current, s);
  });

  return (
    <group>
      <Halo size={3.4} opacity={0.5} position={[0, 0.05, -0.6]} />

      <group ref={phone} rotation={[0.06, -0.22, 0]}>
        {/* Body + back camera */}
        <Slab size={[1.06, 2.12, 0.11]} radius={0.17} finish="dark" />
        <Slab size={[0.32, 0.32, 0.035]} radius={0.08} finish="dark" color={PALETTE.navy} position={[-0.27, 0.72, -0.07]} />
        <Dot radius={0.06} color={PALETTE.deepNavy} finish="dark" position={[-0.33, 0.78, -0.09]} rotation-y={Math.PI} />
        <Dot radius={0.06} color={PALETTE.deepNavy} finish="dark" position={[-0.21, 0.66, -0.09]} rotation-y={Math.PI} />

        {/* Screen */}
        <Slab size={[0.96, 2.02, 0.012]} radius={0.13} color={PALETTE.ice} position={[0, 0, 0.058]} />
        <Slab size={[0.26, 0.07, 0.01]} radius={0.035} finish="dark" position={[0, 0.92, SCREEN]} />
        <TextLine width={0.12} height={0.03} color={PALETTE.navy} position={[-0.33, 0.92, SCREEN]} />

        <TextLine width={0.42} height={0.07} color={PALETTE.navy} position={[-0.2, 0.74, SCREEN]} />

        <group position={[0, 0.42, SCREEN]}>
          <Slab size={[0.82, 0.42, 0.016]} radius={0.07} finish="accent" color={PALETTE.brand} />
          <TextLine width={0.24} height={0.035} color={PALETTE.ice} position={[-0.23, 0.1, 0.012]} />
          <TextLine width={0.46} height={0.085} color={PALETTE.white} position={[-0.12, -0.03, 0.012]} />
          <Dot radius={0.05} color={PALETTE.cyan} finish="glow" position={[0.3, 0.1, 0.012]} />
        </group>

        {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
          <Slab
            key={x}
            size={[0.14, 0.14, 0.016]}
            radius={0.045}
            finish={i === 0 ? "accent" : "matte"}
            color={i === 0 ? PALETTE.electric : PALETTE.white}
            position={[x, 0.07, SCREEN]}
          />
        ))}

        {[-0.2, -0.42, -0.64].map((y) => (
          <group key={y} position={[0, y, SCREEN]}>
            <Dot radius={0.055} color={PALETTE.mist} position={[-0.32, 0, 0.004]} />
            <TextLine width={0.36} height={0.04} color={PALETTE.navy} position={[-0.04, 0.03, 0]} />
            <TextLine width={0.22} height={0.03} position={[-0.11, -0.04, 0]} />
            <TextLine width={0.12} height={0.04} color={PALETTE.royal} position={[0.32, 0.03, 0]} />
          </group>
        ))}

        <Slab size={[0.82, 0.16, 0.016]} radius={0.08} color={PALETTE.white} position={[0, -0.88, SCREEN]} />
        {[-0.27, -0.09, 0.09, 0.27].map((x, i) => (
          <Dot
            key={x}
            radius={0.03}
            color={i === 0 ? PALETTE.brand : PALETTE.mist}
            finish={i === 0 ? "accent" : "matte"}
            position={[x, -0.88, SCREEN + 0.012]}
          />
        ))}
      </group>

      {/* Orbiting app icons */}
      {ORBIT.map((o, i) => (
        <group
          key={i}
          ref={(el) => { icons.current[i] = el; }}
          position={[Math.cos((i * Math.PI * 2) / 3) * 1.45, o.y, Math.sin((i * Math.PI * 2) / 3) * 0.65]}
        >
          <Slab size={[0.3, 0.3, 0.06]} radius={0.085} finish={o.finish} color={o.color} />
          <Slab
            size={[0.12, 0.12, 0.012]}
            radius={0.035}
            finish={o.finish === "glass" ? "accent" : "matte"}
            color={o.finish === "glass" ? PALETTE.royal : PALETTE.white}
            position={[0, 0, 0.036]}
          />
        </group>
      ))}

      {/* Notification */}
      <group ref={notice} position={[0.57, 1.02, 0.4]}>
        <Slab size={[0.96, 0.22, 0.04]} radius={0.11} finish="glass" />
        <Slab size={[0.13, 0.13, 0.016]} radius={0.04} finish="accent" color={PALETTE.brand} position={[-0.35, 0, 0.026]} />
        <TextLine width={0.44} height={0.035} color={PALETTE.navy} position={[0.0, 0.035, 0.024]} />
        <TextLine width={0.3} height={0.028} position={[-0.07, -0.035, 0.024]} />
      </group>

      <GroundShadow width={2.2} depth={0.7} y={-1.4} opacity={0.4} />
    </group>
  );
}
