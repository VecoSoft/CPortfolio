"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { quoteSchema, type QuoteFormValues } from "@/lib/validations/contact";
import Button from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";
import { cn, formInputClass, formLabelClass, formErrorClass } from "@/lib/utils";
import ServiceSelector from "@/components/contact/service-visual/ServiceSelector";
import ServiceVisual from "@/components/contact/service-visual/ServiceVisual";

const BUDGETS = ["Under $2,000", "$2,000 – $5,000", "$5,000 – $15,000", "$15,000+", "Not sure yet"];
const TIMELINES = ["ASAP", "1–2 months", "3–6 months", "Flexible"];

export default function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<QuoteFormValues>({ resolver: zodResolver(quoteSchema) });

  const selectedType = watch("projectType");

  async function onSubmit(data: QuoteFormValues) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        throw new Error(result.error || "Something went wrong. Please try again.");
      }
      setSubmitted(true);
      reset();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Soft focus halo on top of the shared input style (quote form only).
  const inputClass = cn(formInputClass, "focus:shadow-[0_0_0_4px_rgba(46,94,255,0.1)] transition-[border-color,box-shadow]");
  const labelClass = formLabelClass;
  const errorClass = formErrorClass;

  if (submitted) {
    return (
      <div className="flex flex-col items-center px-8 py-20 text-center">
        <CheckCircle2 className="h-10 w-10 text-[var(--color-cyan)]" />
        <h3 className="mt-4 text-lg font-medium text-[var(--color-paper)]">Inquiry received</h3>
        <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
          Thanks for the details. We&apos;ll review your project and reply within 24–48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("company_website")} />

      {/* Step 1 — the visual highlight: service picker + live 3D preview */}
      <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-2 md:items-center md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10 lg:p-10">
        <div>
          <StepLabel step="01" id="quote-service-label">What do you need?</StepLabel>
          <ServiceSelector
            value={selectedType}
            onChange={(id) => setValue("projectType", id, { shouldValidate: true })}
            labelId="quote-service-label"
          />
          {errors.projectType && <p className={errorClass}>{errors.projectType.message}</p>}
        </div>
        <ServiceVisual service={selectedType ?? null} />
      </div>

      <div className="border-t border-[var(--color-border)] bg-[linear-gradient(180deg,var(--color-surface-raised),var(--color-surface)_160px)] p-6 sm:p-8 lg:p-10">
        {/* Step 2 */}
        <div className="space-y-6">
          <StepLabel step="02">Project details</StepLabel>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="quote-budget" className={labelClass}>Budget</label>
              <select id="quote-budget" className={inputClass} defaultValue="" {...register("budget")}>
                <option value="" disabled>Select a range</option>
                {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.budget && <p className={errorClass}>{errors.budget.message}</p>}
            </div>
            <div>
              <label htmlFor="quote-timeline" className={labelClass}>Timeline</label>
              <select id="quote-timeline" className={inputClass} defaultValue="" {...register("timeline")}>
                <option value="" disabled>Select a timeline</option>
                {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.timeline && <p className={errorClass}>{errors.timeline.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="quote-description" className={labelClass}>Project Description</label>
            <textarea id="quote-description" className={inputClass} rows={5} placeholder="What are you building? What problem does it solve?" {...register("description")} />
            {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          </div>
        </div>

        {/* Step 3 */}
        <div className="mt-10 space-y-6">
          <StepLabel step="03">Your details</StepLabel>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="quote-name" className={labelClass}>Name</label>
              <input id="quote-name" autoComplete="name" className={inputClass} placeholder="Your name" {...register("name")} />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="quote-email" className={labelClass}>Email</label>
              <input id="quote-email" type="email" autoComplete="email" inputMode="email" className={inputClass} placeholder="you@email.com" {...register("email")} />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="quote-phone" className={labelClass}>
                Mobile Number <span className="font-normal text-[var(--color-muted-2)]">(optional)</span>
              </label>
              <input id="quote-phone" type="tel" autoComplete="tel" inputMode="tel" className={inputClass} placeholder="+880 1XXX-XXXXXX" {...register("phone")} />
              {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--color-muted)]">We reply within 24–48 hours.</p>
          <Button type="submit" variant="primary" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "Submitting..." : "Submit Inquiry"}
          </Button>
        </div>
        {submitError && <p className={errorClass}>{submitError}</p>}
      </div>
    </form>
  );
}

function StepLabel({ step, id, children }: { step: string; id?: string; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[var(--color-electric)]/10 px-2 font-mono text-xs font-medium text-[var(--color-electric)]">
        {step}
      </span>
      <span id={id} className="text-base font-semibold text-[var(--color-paper)]">{children}</span>
    </div>
  );
}
