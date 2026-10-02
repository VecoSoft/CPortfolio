"use client";

import { useEffect, useState } from "react";
import { MotionConfig, motion } from "motion/react";
import { cn } from "@/lib/utils";
import ServiceVisual from "@/components/service-3d/ServiceVisual";
import { SERVICE_IDS, SERVICES, type ServiceId } from "@/components/service-3d/serviceConfig";

// Services hero: the 3D stage with a tab strip of every service. It tours
// the services on its own every few seconds until the visitor picks one,
// then stays on their choice. No auto-tour under reduced motion, or while
// the tab is in the background.

const TOUR_MS = 5000;

export default function ServicesHeroShowcase() {
  const [active, setActive] = useState<ServiceId>("Web");
  const [touring, setTouring] = useState(true);

  useEffect(() => {
    if (!touring || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setActive((cur) => SERVICE_IDS[(SERVICE_IDS.indexOf(cur) + 1) % SERVICE_IDS.length]);
    }, TOUR_MS);
    return () => window.clearInterval(id);
  }, [touring]);

  function pick(id: ServiceId) {
    setTouring(false);
    setActive(id);
  }

  const info = SERVICES[active];

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 shadow-[0_30px_70px_-45px_rgba(11,23,54,0.35)] sm:p-3">
        <ServiceVisual service={active} showCaption={false} className="aspect-[4/3] rounded-[1.25rem]" />

        <div className="mt-3 flex items-center justify-between gap-3 px-1 sm:mt-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--color-paper)]">{info.title}</p>
            <p className="truncate text-xs text-[var(--color-muted-2)]">{info.tags.join(" · ")}</p>
          </div>
          {touring && (
            <span className="hidden shrink-0 items-center gap-1.5 text-xs text-[var(--color-muted-2)] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-electric)] motion-safe:animate-pulse" />
              Auto-preview
            </span>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Preview a service"
          className="mt-3 grid grid-cols-3 gap-1.5 rounded-2xl bg-[var(--color-surface-raised)] p-1.5"
        >
          {SERVICE_IDS.map((id) => {
            const Icon = SERVICES[id].icon;
            const selected = id === active;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => pick(id)}
                className={cn(
                  "focus-ring relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-xs font-medium transition-colors",
                  selected ? "text-[var(--color-paper)]" : "text-[var(--color-muted)] hover:text-[var(--color-paper)]"
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="services-hero-tab"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    className="absolute inset-0 rounded-xl bg-[var(--color-surface)] shadow-[0_6px_16px_-10px_rgba(11,23,54,0.4)] ring-1 ring-[var(--color-electric)]/30"
                  />
                )}
                <Icon className={cn("relative h-4 w-4", selected && "text-[var(--color-electric)]")} strokeWidth={1.75} />
                <span className="relative">{id}</span>
              </button>
            );
          })}
        </div>
      </div>
    </MotionConfig>
  );
}
