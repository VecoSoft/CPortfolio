"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { quoteSchema, type QuoteFormValues } from "@/lib/validations/contact";
import Button from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";
import { cn, formInputClass, formLabelClass, formErrorClass } from "@/lib/utils";

const PROJECT_TYPES = ["Web", "Mobile", "AI/ML", "Software", "UI/UX", "Other"] as const;
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

  const inputClass = formInputClass;
  const labelClass = formLabelClass;
  const errorClass = formErrorClass;

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-16 text-center">
        <CheckCircle2 className="h-10 w-10 text-[var(--color-cyan)]" />
        <h3 className="mt-4 text-lg font-medium text-[var(--color-paper)]">Inquiry received</h3>
        <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
          Thanks for the details. We&apos;ll review your project and reply within 24–48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("company_website")} />

      <div>
        <span className={labelClass}>What do you need?</span>
        <div className="flex flex-wrap gap-2">
          {PROJECT_TYPES.map((type) => (
            <button
              type="button"
              key={type}
              aria-pressed={selectedType === type}
              onClick={() => setValue("projectType", type, { shouldValidate: true })}
              className={cn(
                "focus-ring min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                selectedType === type
                  ? "border-[var(--color-electric)] bg-[var(--color-electric)]/10 text-[var(--color-paper)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-border-hover)]"
              )}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.projectType && <p className={errorClass}>{errors.projectType.message}</p>}
      </div>

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

      <Button type="submit" variant="primary" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Submitting..." : "Submit Inquiry"}
      </Button>
      {submitError && <p className={errorClass}>{submitError}</p>}
    </form>
  );
}
