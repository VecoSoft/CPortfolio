import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import TextReveal from "@/components/ui/TextReveal";
import type { SiteSettingsDoc } from "@/sanity/types";
import { SITE, FEATURES } from "@/lib/constants";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Explore",
    links: [
      ...(FEATURES.solutions ? [{ label: "Solutions", href: "/solutions" }] : []),
      ...(FEATURES.products ? [{ label: "Products", href: "/products" }] : []),
      ...(FEATURES.work ? [{ label: "Work", href: "/work" }] : []),
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Start a Project", href: "/get-a-quote" },
    ],
  },
];

// Accepts Site Settings + a short list of Services fetched once in the
// root layout (see (site)/layout.tsx). The Services column used to be
// hardcoded to three specific slugs ("web-development", etc.) — this
// broke the moment real Sanity services existed with different slugs,
// since the footer would link to services no longer shown on /services
// at all. It's now built from the same real data (or the same
// constants.ts fallback) the /services page itself uses, so the two can
// never drift out of sync.
export default function Footer({
  settings,
  services = [],
}: {
  settings?: SiteSettingsDoc | null;
  services?: { name: string; slug: string }[];
}) {
  const name = settings?.companyName || SITE.name;
  const tagline = settings?.tagline || SITE.tagline;
  const email = settings?.email || SITE.email;
  const location = settings?.location || SITE.location;
  const social = settings?.socialLinks;

  const socials = [
    { label: "in", name: "LinkedIn", href: social?.linkedin || SITE.social.linkedin },
    { label: "gh", name: "GitHub", href: social?.github || SITE.social.github },
    { label: "fb", name: "Facebook", href: social?.facebook || SITE.social.facebook },
    { label: "x", name: "X", href: social?.x || SITE.social.x },
  ];

  // Show up to 3 real services by name, always ending with "All Services"
  // — never a hardcoded specific slug that could silently stop matching
  // real content.
  const servicesColumn = {
    title: "Services",
    links: [
      ...services.slice(0, 3).map((s) => ({ label: s.name, href: `/services/${s.slug}` })),
      { label: "All Services", href: "/services" },
    ],
  };
  const allColumns = [columns[0], servicesColumn, ...columns.slice(1)];

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:gap-10 lg:grid-cols-6">
          <div className="col-span-2">
            <Image src="/logo.png" alt={name} width={742} height={200} className="h-10 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-muted)]">
              <TextReveal text={tagline} triggerOnView staggerMs={45} />
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-xs font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-cyan)]"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {allColumns.filter((col) => col.links.length > 0).map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow text-xs font-medium text-[var(--color-muted-2)]">
                {col.title.toUpperCase()}
              </h3>
              <ul className="mt-4 space-y-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="focus-ring -mx-2 flex min-h-[40px] items-center rounded-md px-2 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-paper)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-muted-2)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
            <span>{email}</span>
            <span>{location}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>© {new Date().getFullYear()} {name}</span>
            <Link href="/privacy-policy" className="focus-ring hover:text-[var(--color-paper)]">Privacy Policy</Link>
            <Link href="/terms-of-service" className="focus-ring hover:text-[var(--color-paper)]">Terms of Service</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
