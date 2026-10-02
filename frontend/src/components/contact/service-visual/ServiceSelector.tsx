"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { SERVICE_IDS, SERVICES, type ServiceId } from "./serviceConfig";

// The "What do you need?" picker. Still plain toggle buttons
// (aria-pressed) feeding the same react-hook-form field as before; the
// active highlight is a single shared-layout element that glides between
// tiles, and the copy below crossfades to describe the current pick.
export default function ServiceSelector({
  value,
  onChange,
  labelId,
}: {
  value: ServiceId | undefined;
  onChange: (id: ServiceId) => void;
  labelId: string;
}) {
  const info = value ? SERVICES[value] : null;

  return (
    // reducedMotion="user": the highlight snaps instead of gliding when
    // the OS asks for less motion.
    <MotionConfig reducedMotion="user">
      <div role="group" aria-labelledby={labelId} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
        {SERVICE_IDS.map((id) => {
          const { icon: Icon } = SERVICES[id];
          const active = value === id;
          return (
            <button
              type="button"
              key={id}
              aria-pressed={active}
              onClick={() => onChange(id)}
              className={cn(
                "focus-ring group relative flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium",
                "transition-[transform,box-shadow,border-color,color] duration-200 ease-out",
                active
                  ? "border-transparent text-[var(--color-paper)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:-translate-y-0.5 hover:border-[var(--color-border-hover)] hover:text-[var(--color-paper)] hover:shadow-[0_10px_24px_-16px_rgba(11,23,54,0.35)]"
              )}
            >
              {active && (
                <motion.span
                  layoutId="service-active"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  className="absolute inset-0 rounded-xl border border-[var(--color-electric)] bg-[linear-gradient(135deg,rgba(46,94,255,0.09),rgba(46,94,255,0.03))] shadow-[0_0_0_4px_rgba(46,94,255,0.08),0_12px_28px_-14px_rgba(46,94,255,0.6)]"
                />
              )}
              <span
                className={cn(
                  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                  active
                    ? "bg-[var(--color-electric)] text-white shadow-[0_6px_14px_-6px_rgba(46,94,255,0.8)]"
                    : "bg-[var(--color-surface-raised)] text-[var(--color-muted)] group-hover:text-[var(--color-electric)]"
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <span className="relative">{id}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 min-h-[8.5rem] sm:min-h-[7.5rem]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={info?.id ?? "none"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {info ? (
              <>
                <p className="text-lg font-medium text-[var(--color-paper)]">{info.title}</p>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[var(--color-muted)]">{info.blurb}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {info.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-0.5 text-xs text-[var(--color-muted)]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-[var(--color-paper)]">Choose the closest match</p>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[var(--color-muted)]">
                  Pick one to start. You can explain the details below. Not sure? Choose Other.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
