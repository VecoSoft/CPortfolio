import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ServiceVisual from "./ServiceVisual";

type ServiceRowItem = {
  slug: { current: string };
  name: string;
  icon?: string;
  shortDescription: string;
  features: string[];
};

export default function ServiceRow({
  service,
  icon,
  reversed,
}: {
  service: ServiceRowItem;
  icon: LucideIcon;
  reversed: boolean;
}) {
  const Icon = icon;
  const features = (service.features ?? []).slice(0, 3);

  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
      <div className={cn(reversed && "lg:order-2")}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-raised)] text-[var(--color-electric)]">
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-medium text-[var(--color-paper)] sm:text-3xl">
          {service.name}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
          {service.shortDescription}
        </p>
        {features.length > 0 && (
          <ul className="mt-6 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex gap-3 text-sm leading-relaxed text-[var(--color-muted)]">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-electric-soft)]" />
                {f}
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/services/${service.slug.current}`}
          className="focus-ring mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-electric)]"
        >
          Learn more
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className={cn("mx-auto w-full max-w-md", reversed ? "lg:order-1 lg:mr-auto lg:ml-0" : "lg:ml-auto lg:mr-0")}>
        <ServiceVisual icon={service.icon} name={service.name} />
      </div>
    </div>
  );
}
