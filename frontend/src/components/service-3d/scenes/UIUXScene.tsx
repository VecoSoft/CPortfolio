"use client";

import { useRef } from "react";
import type * as THREE from "three";
import { PALETTE } from "../serviceConfig";
import { useIdleFrame } from "../sceneSettings";
import { Slab, TextLine, Dot, Segments, Cursor, GroundShadow, damp } from "../parts";

// UI/UX — a design artboard on a column grid. Its blocks (media, heading,
// body, button, swatches) re-flow between three layouts on a loop, each
// block easing into place a beat after the previous one. A selection box
// rides on the media block and the cursor trails it, as if dragging; a
// small layers panel floats beside the board.

type Vec2 = [number, number];
// Order: media, heading, body, button, swatches.
const LAYOUTS: Vec2[][] = [
  [[-0.55, 0.12], [0.5, 0.45], [0.5, 0.15], [0.29, -0.16], [-0.78, -0.58]],
  [[0.55, 0.12], [-0.5, 0.45], [-0.5, 0.15], [-0.71, -0.16], [0.64, -0.58]],
  [[0, 0.33], [0, -0.17], [0, -0.38], [0, -0.62], [0.82, -0.62]],
];
const STEP = 3.4; // seconds per layout
const STAGGER = 0.12;
const Z = [0.07, 0.1, 0.1, 0.13, 0.13];

const GRID: [number, number, number][] = [];
for (let i = 0; i <= 6; i++) {
  const x = -1.1 + i * (2.2 / 6);
  GRID.push([x, -0.78, 0.032], [x, 0.78, 0.032]);
}

const MEDIA_W = 0.96;
const MEDIA_H = 0.62;
const pad = 0.05;
const SELECTION: [number, number, number][] = [
  [-MEDIA_W / 2 - pad, -MEDIA_H / 2 - pad, 0.02], [MEDIA_W / 2 + pad, -MEDIA_H / 2 - pad, 0.02],
  [MEDIA_W / 2 + pad, -MEDIA_H / 2 - pad, 0.02], [MEDIA_W / 2 + pad, MEDIA_H / 2 + pad, 0.02],
  [MEDIA_W / 2 + pad, MEDIA_H / 2 + pad, 0.02], [-MEDIA_W / 2 - pad, MEDIA_H / 2 + pad, 0.02],
  [-MEDIA_W / 2 - pad, MEDIA_H / 2 + pad, 0.02], [-MEDIA_W / 2 - pad, -MEDIA_H / 2 - pad, 0.02],
];
const HANDLES: Vec2[] = [
  [-MEDIA_W / 2 - pad, -MEDIA_H / 2 - pad], [MEDIA_W / 2 + pad, -MEDIA_H / 2 - pad],
  [MEDIA_W / 2 + pad, MEDIA_H / 2 + pad], [-MEDIA_W / 2 - pad, MEDIA_H / 2 + pad],
];

export default function UIUXScene() {
  const board = useRef<THREE.Group>(null!);
  const blocks = useRef<(THREE.Group | null)[]>([]);
  const cursor = useRef<THREE.Group>(null!);
  const panel = useRef<THREE.Group>(null!);

  useIdleFrame((t, dt) => {
    board.current.rotation.y = 0.2 + Math.sin(t * 0.3) * 0.12;
    board.current.position.y = Math.sin(t * 0.7) * 0.05;
    panel.current.position.y = 0.12 + Math.sin(t * 0.8 + 1) * 0.04;

    blocks.current.forEach((block, i) => {
      if (!block) return;
      const layout = LAYOUTS[Math.floor(Math.max(t - i * STAGGER, 0) / STEP) % LAYOUTS.length];
      const [x, y] = layout[i];
      block.position.x = damp(block.position.x, x, 4.2, dt);
      block.position.y = damp(block.position.y, y, 4.2, dt);
      // Lift slightly off the board while moving — reads as "dragging a layer".
      const moving = Math.abs(block.position.x - x) + Math.abs(block.position.y - y);
      block.position.z = damp(block.position.z, Z[i] + Math.min(moving, 0.4) * 0.35, 6, dt);
    });

    const media = blocks.current[0];
    if (media) {
      cursor.current.position.x = damp(cursor.current.position.x, media.position.x + 0.3, 3, dt);
      cursor.current.position.y = damp(cursor.current.position.y, media.position.y - 0.12, 3, dt);
    }
  });

  return (
    <group>
      <group ref={board} rotation={[0.04, 0.2, 0]} position={[0.22, 0, 0]}>
        <Slab size={[2.5, 1.72, 0.05]} radius={0.08} finish="glass" />
        <Segments points={GRID} opacity={0.12} />

        <group ref={(el) => { blocks.current[0] = el; }} position={[LAYOUTS[0][0][0], LAYOUTS[0][0][1], Z[0]]}>
          <Slab size={[MEDIA_W, MEDIA_H, 0.02]} radius={0.06} finish="accent" color={PALETTE.royal} />
          <Dot radius={0.08} color={PALETTE.ice} position={[0.24, 0.14, 0.015]} />
          <Slab size={[0.5, 0.2, 0.012]} radius={0.04} color={PALETTE.electric} finish="glow" position={[-0.14, -0.16, 0.014]} />
          <Segments points={SELECTION} color={PALETTE.brand} opacity={0.9} />
          {HANDLES.map(([x, y]) => (
            <Slab key={`${x}${y}`} size={[0.05, 0.05, 0.012]} radius={0.008} color={PALETTE.white} position={[x, y, 0.025]} />
          ))}
        </group>

        <group ref={(el) => { blocks.current[1] = el; }} position={[LAYOUTS[0][1][0], LAYOUTS[0][1][1], Z[1]]}>
          <TextLine width={0.9} height={0.09} color={PALETTE.navy} position={[0, 0.06, 0]} />
          <TextLine width={0.62} height={0.09} color={PALETTE.navy} position={[-0.14, -0.08, 0]} />
        </group>

        <group ref={(el) => { blocks.current[2] = el; }} position={[LAYOUTS[0][2][0], LAYOUTS[0][2][1], Z[2]]}>
          <TextLine width={0.9} position={[0, 0.03, 0]} />
          <TextLine width={0.74} position={[-0.08, -0.05, 0]} />
        </group>

        <group ref={(el) => { blocks.current[3] = el; }} position={[LAYOUTS[0][3][0], LAYOUTS[0][3][1], Z[3]]}>
          <Slab size={[0.48, 0.14, 0.03]} radius={0.07} finish="accent" color={PALETTE.brand} />
          <TextLine width={0.22} height={0.035} color={PALETTE.white} position={[0, 0, 0.02]} />
        </group>

        <group ref={(el) => { blocks.current[4] = el; }} position={[LAYOUTS[0][4][0], LAYOUTS[0][4][1], Z[4]]}>
          {[PALETTE.deepNavy, PALETTE.royal, PALETTE.electric, PALETTE.ice].map((c, i) => (
            <Dot key={c} radius={0.065} color={c} finish={i === 3 ? "matte" : "accent"} position={[-0.24 + i * 0.16, 0, 0]} />
          ))}
        </group>

        <Cursor ref={cursor} position={[LAYOUTS[0][0][0] + 0.3, LAYOUTS[0][0][1] - 0.12, 0.4]} />
      </group>

      {/* Layers panel */}
      <group ref={panel} position={[-1.62, 0.12, 0.45]} rotation={[0, 0.28, 0]}>
        <Slab size={[0.6, 0.98, 0.035]} radius={0.07} finish="glass" />
        <TextLine width={0.24} height={0.035} color={PALETTE.navy} position={[-0.12, 0.38, 0.022]} />
        {[0.2, 0.06, -0.08, -0.22, -0.36].map((y, i) => (
          <group key={y} position={[0, y, 0.022]}>
            {i === 0 && <Slab size={[0.5, 0.11, 0.008]} radius={0.03} color={PALETTE.ice} />}
            <Slab
              size={[0.06, 0.06, 0.008]}
              radius={0.012}
              finish={i === 0 ? "accent" : "matte"}
              color={i === 0 ? PALETTE.brand : PALETTE.mist}
              position={[-0.18, 0, 0.006]}
            />
            <TextLine width={0.26} height={0.03} color={i === 0 ? PALETTE.navy : PALETTE.mist} position={[0.03, 0, 0.006]} />
          </group>
        ))}
      </group>

      <GroundShadow width={3.2} depth={0.9} y={-1.3} opacity={0.38} />
    </group>
  );
}
