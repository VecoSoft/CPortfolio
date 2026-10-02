import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import QuoteForm from "@/components/contact/QuoteForm";

export const metadata: Metadata = {
  title: "Get a Quote",
  description: "Tell us about your project and get a response from VecoSoft within 24-48 hours.",
};

export default function GetAQuotePage() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
          <h1 className="text-fluid-hero mt-4 max-w-xl font-medium text-[var(--color-paper)]">
            Tell us what you&apos;re building.
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-[var(--color-muted)]">
            The more detail you share, the more useful our first response will be.
            We reply within 24–48 hours with next steps — no automated sales calls.
          </p>
        </div>
        <div className="mt-10 overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_40px_90px_-50px_rgba(11,23,54,0.35)] sm:mt-14">
          <QuoteForm />
        </div>
      </Container>
    </section>
  );
}
