"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { SERVICES, type ServiceId } from "./serviceConfig";

// three.js + R3F live entirely in ServiceCanvas's chunk. ssr: false keeps
// WebGL out of the server render (no hydration mismatch), and the chunk
// is requested only once this panel nears the viewport.
const ServiceCanvas = dynamic(() => import("./ServiceCanvas"), { ssr: false });

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

export default function ServiceVisual({ service }: { service: ServiceId | null }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [ready, setReady] = useState(false);

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const lowPower = useMediaQuery("(max-width: 767px), (pointer: coarse)");
  const finePointer = useMediaQuery("(pointer: fine)");

  // `near` mounts the canvas a little before it scrolls in; `onScreen`
  // pauses the render loop whenever it's scrolled out of view.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Parallax input, written to a ref so moving the mouse never re-renders.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !finePointer || reducedMotion) return;
    function onMove(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    }
    function onLeave() {
      pointer.current.x = 0;
      pointer.current.y = 0;
    }
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [finePointer, reducedMotion]);

  const info = service ? SERVICES[service] : null;
  const Icon = info?.icon;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="service-visual relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-[var(--color-border)] sm:aspect-[4/3] md:aspect-[5/4]"
    >
      {/* Static backdrop: visible immediately, and the whole visual if
          WebGL is unavailable. Fixed aspect ratio = no layout shift. */}
      <div className="service-visual-grid absolute inset-0" />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff,#c9d8f0_45%,#3b82f6_100%)] opacity-60 blur-[2px] transition-opacity duration-700",
          ready && "opacity-0"
        )}
      />

      {near && (
        <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
          <ServiceCanvas
            service={service ?? "Other"}
            running={onScreen}
            reducedMotion={reducedMotion}
            lowPower={lowPower}
            pointer={pointer}
            onReady={() => setReady(true)}
          />
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-1.5 text-xs font-medium text-[var(--color-paper)] shadow-sm backdrop-blur-sm sm:bottom-4 sm:left-4">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-electric)] opacity-40 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-electric)]" />
        </span>
        {Icon && <Icon className="h-3.5 w-3.5 text-[var(--color-electric)]" />}
        {info ? info.title : "Pick a service to preview"}
      </div>
    </div>
  );
}
