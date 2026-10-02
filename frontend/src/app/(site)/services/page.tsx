import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { sanityFetchList } from "@/sanity/fetch";
import { SERVICE_LIST_QUERY } from "@/sanity/queries";
import { fallbackServices } from "@/sanity/fallbacks";
import type { ServiceDoc } from "@/sanity/types";
import ServiceRow from "@/components/services/ServiceRow";
import ServicesHeroShowcase from "@/components/services/ServicesHeroShowcase";
import {
  Code2, BrainCircuit, Smartphone, PenTool, Cloud, Settings2, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Code2, BrainCircuit, Smartphone, PenTool, Cloud, Settings2,
};

export const metadata: Metadata = {
  title: "Services",
  description: "Web development, AI & ML, mobile apps, UI/UX design, cloud & DevOps, and custom software from VecoSoft.",
};

export default async function ServicesPage() {
  const fetched = await sanityFetchList<ServiceDoc>(SERVICE_LIST_QUERY, {}, { tags: ["service"] });
  const services = fetched.length > 0 ? fetched : fallbackServices();

  return (
    <div>
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid-field absolute inset-0 -z-10" />
        <div
          className="absolute -top-40 left-1/2 -z-10 h-[520px] w-[min(820px,140vw)] -translate-x-1/2 rounded-full opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(circle, var(--color-electric) 0%, transparent 70%)" }}
        />

        <Container className="grid gap-10 sm:gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h1 className="text-fluid-hero text-balance font-medium text-[var(--color-paper)]">
              Everything a growing product needs,{" "}
              <span className="text-[var(--color-electric)]">under one roof.</span>
            </h1>
            <p className="mt-5 max-w-lg text-balance text-base leading-relaxed text-[var(--color-muted)] sm:mt-6 sm:text-lg">
              We work across the full stack — from first design concept to the infrastructure keeping your product online.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <Button href="/get-a-quote" variant="primary" showArrow className="w-full sm:w-auto">
                Start a Project
              </Button>
              <Button href="/contact" variant="secondary" className="w-full sm:w-auto">
                Contact Us
              </Button>
            </div>
          </div>

          <ServicesHeroShowcase />
        </Container>
      </section>

      <div className="pb-20 sm:pb-28">
        <Container>
          <div className="space-y-16 sm:space-y-24">
            {services.map((service, i) => (
              <ServiceRow
                key={service._id}
                service={service}
                icon={ICONS[service.icon] ?? Settings2}
                reversed={i % 2 === 1}
              />
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
}
