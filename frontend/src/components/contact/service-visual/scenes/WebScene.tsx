"use client";

import { useRef } from "react";
import type * as THREE from "three";
import { PALETTE } from "../serviceConfig";
import { useIdleFrame } from "../sceneSettings";
import { Slab, TextLine, Dot, Segments, Cursor, GroundShadow, fadeGroup, pulseWindow, smooth } from "../parts";

// WEB — a floating browser window with a real page layout inside, plus
// three detached UI cards (analytics, profile, toast) that take turns
// drifting in and out, each tethered back to the page by a thin line.

const FRONT = 0.046; // just in front of the window's face

const CARD_TETHERS: [number, number, number][][] = [
  [[0, 0, 0], [-0.45, -0.2, -0.4]],
  [[0, 0, 0], [0.5, -0.05, -0.45]],
  [[0, 0, 0], [-0.45, 0.16, -0.5]],
];

export default function WebScene() {
  const root = useRef<THREE.Group>(null!);
  const cards = useRef<(THREE.Group | null)[]>([]);
  const cursor = useRef<THREE.Group>(null!);

  useIdleFrame((t) => {
    root.current.rotation.y = -0.16 + Math.sin(t * 0.32) * 0.2;
    root.current.rotation.x = 0.05 + Math.sin(t * 0.26) * 0.04;
    root.current.position.y = Math.sin(t * 0.75) * 0.06;

    cards.current.forEach((card, i) => {
      if (!card) return;
      const s = smooth(pulseWindow(t, 9, i * 3, 0.72));
      card.scale.setScalar(0.82 + 0.18 * s);
      card.position.z = card.userData.z - (1 - s) * 0.25;
      fadeGroup(card, s);
    });

    cursor.current.position.x = -0.35 + Math.sin(t * 0.6) * 0.55;
    cursor.current.position.y = 0.05 + Math.sin(t * 0.95 + 1) * 0.28;
  });

  return (
    <group>
      <group ref={root} rotation={[0.05, -0.16, 0]}>
        {/* Window */}
        <Slab size={[2.7, 1.8, 0.07]} radius={0.12} finish="glass" />

        {/* Chrome: tab bar, traffic dots, address pill */}
        <Slab size={[2.56, 0.17, 0.012]} radius={0.06} color={PALETTE.ice} position={[0, 0.74, FRONT]} />
        <Dot radius={0.025} color={PALETTE.mist} position={[-1.17, 0.74, FRONT + 0.008]} />
        <Dot radius={0.025} color={PALETTE.mist} position={[-1.09, 0.74, FRONT + 0.008]} />
        <Dot radius={0.025} color={PALETTE.electric} finish="glow" position={[-1.01, 0.74, FRONT + 0.008]} />
        <Slab size={[1.15, 0.085, 0.01]} radius={0.04} color={PALETTE.white} position={[0.05, 0.74, FRONT + 0.008]} />

        {/* Nav */}
        <Slab size={[0.24, 0.07, 0.012]} radius={0.02} finish="accent" position={[-1.07, 0.5, FRONT]} />
        {[0.55, 0.78, 1.01].map((x) => (
          <TextLine key={x} width={0.16} height={0.035} position={[x, 0.5, FRONT]} />
        ))}

        {/* Hero copy + CTA */}
        <TextLine width={1.05} height={0.09} color={PALETTE.navy} position={[-0.675, 0.26, FRONT]} />
        <TextLine width={0.72} height={0.09} color={PALETTE.navy} position={[-0.84, 0.12, FRONT]} />
        <TextLine width={0.92} position={[-0.74, -0.02, FRONT]} />
        <TextLine width={0.66} position={[-0.87, -0.1, FRONT]} />
        <Slab size={[0.38, 0.12, 0.02]} radius={0.06} finish="accent" color={PALETTE.brand} position={[-1.01, -0.28, FRONT]} />

        {/* Hero media */}
        <Slab size={[1.0, 0.64, 0.016]} radius={0.06} color={PALETTE.ice} position={[0.62, 0.1, FRONT]} />
        <Slab size={[0.5, 0.3, 0.02]} radius={0.05} finish="accent" position={[0.5, 0.02, FRONT + 0.01]} />
        <Dot radius={0.1} color={PALETTE.electric} finish="glow" position={[0.86, 0.24, FRONT + 0.012]} />

        {/* Feature cards row */}
        {[-0.86, 0, 0.86].map((x) => (
          <group key={x} position={[x, -0.6, FRONT]}>
            <Slab size={[0.74, 0.36, 0.014]} radius={0.05} color={PALETTE.ice} />
            <Dot radius={0.04} color={PALETTE.royal} finish="accent" position={[-0.26, 0.06, 0.01]} />
            <TextLine width={0.4} height={0.035} position={[-0.06, -0.07, 0.008]} />
          </group>
        ))}

        {/* Detached cards — each holds its own tether so it fades as one */}
        <group ref={(el) => { cards.current[0] = el; }} position={[1.55, 0.6, 0.45]} userData={{ z: 0.45 }}>
          <Slab size={[0.74, 0.5, 0.035]} radius={0.07} finish="glass" />
          {[0.1, 0.19, 0.14, 0.26].map((h, i) => (
            <Slab
              key={i}
              size={[0.09, h, 0.02]}
              radius={0.02}
              finish={i === 3 ? "accent" : "matte"}
              color={i === 3 ? PALETTE.royal : PALETTE.mist}
              position={[-0.21 + i * 0.14, -0.15 + h / 2, 0.025]}
            />
          ))}
          <TextLine width={0.3} height={0.035} position={[-0.13, 0.17, 0.022]} />
          <Segments points={CARD_TETHERS[0]} opacity={0.35} />
        </group>

        <group ref={(el) => { cards.current[1] = el; }} position={[-1.62, -0.3, 0.5]} userData={{ z: 0.5 }}>
          <Slab size={[0.74, 0.3, 0.035]} radius={0.07} finish="glass" />
          <Dot radius={0.07} color={PALETTE.electric} finish="accent" position={[-0.22, 0, 0.022]} />
          <TextLine width={0.32} height={0.04} color={PALETTE.navy} position={[0.06, 0.04, 0.022]} />
          <TextLine width={0.22} height={0.03} position={[0.01, -0.05, 0.022]} />
          <Segments points={CARD_TETHERS[1]} opacity={0.35} />
        </group>

        <group ref={(el) => { cards.current[2] = el; }} position={[1.3, -0.8, 0.55]} userData={{ z: 0.55 }}>
          <Slab size={[0.66, 0.17, 0.035]} radius={0.085} finish="dark" />
          <Dot radius={0.032} color={PALETTE.cyan} finish="glow" position={[-0.22, 0, 0.022]} />
          <TextLine width={0.32} height={0.032} color={PALETTE.ice} position={[0.06, 0, 0.022]} />
          <Segments points={CARD_TETHERS[2]} opacity={0.35} />
        </group>

        <Cursor ref={cursor} position={[-0.35, 0.05, 0.3]} />
      </group>

      <GroundShadow width={3.2} depth={0.9} y={-1.35} opacity={0.42} />
    </group>
  );
}
