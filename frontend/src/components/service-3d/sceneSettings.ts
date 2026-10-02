import { createContext, useContext, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export type SceneSettings = {
  // prefers-reduced-motion: scenes render a still, composed pose and skip
  // their idle loops; only the (shortened) selection crossfade animates.
  reducedMotion: boolean;
  // Small screens / coarse pointers: fewer particles and nodes.
  lowPower: boolean;
};

export const SceneSettingsContext = createContext<SceneSettings>({
  reducedMotion: false,
  lowPower: false,
});

export function useSceneSettings() {
  return useContext(SceneSettingsContext);
}

// Idle animation hook for scenes. `t` is seconds since this scene mounted
// (so every scene starts from the same pose regardless of how long the
// canvas has been running). Skipped entirely under reduced motion — the
// scene's JSX is authored so its static props are already a good still.
export function useIdleFrame(cb: (t: number, dt: number) => void) {
  const { reducedMotion } = useSceneSettings();
  const t = useRef(0);
  useFrame((_, dt) => {
    if (reducedMotion) return;
    // Clamp so a backgrounded tab doesn't jump the animation on return.
    const step = Math.min(dt, 1 / 20);
    t.current += step;
    cb(t.current, step);
  });
}

// Count of instanced particles / nodes scaled for the device.
export function useCount(desktop: number, mobile: number) {
  const { lowPower } = useSceneSettings();
  return lowPower ? mobile : desktop;
}
