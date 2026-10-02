"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { NAV_LINKS, SITE, FEATURES } from "@/lib/constants";

export default function Navbar({
  productCategories = [],
}: {
  productCategories?: { name: string; slug: string }[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Merge Sanity-driven category links into the "Products" dropdown at
  // render time — constants.ts only defines "All Products" statically
  // (see its comment); everything else scales with however many
  // categories actually exist, not individual products.
  const visibleNavLinks = NAV_LINKS.filter((link) => {
    if (link.label === "Solutions") return FEATURES.solutions;
    if (link.label === "Products") return FEATURES.products;
    if (link.label === "Work") return FEATURES.work;
    return true;
  });
  const effectiveNavLinks = visibleNavLinks.map((link) =>
    link.label === "Products" && "dropdown" in link && link.dropdown
      ? {
        ...link,
        dropdown: [
          ...link.dropdown,
          ...productCategories.map((c) => ({
            label: c.name,
            href: `/products?category=${c.slug}`,
          })),
        ],
      }
      : link
  );

  // Close mobile menu on route change — derived during render, no effect needed.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scroll while the mobile menu is open, and let Escape
  // close it — a full-screen drawer that leaves the page scrolling behind
  // it feels broken on a phone.
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  return (
    <>
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled
          ? "border-b border-[var(--color-border)] bg-[var(--color-ink)]/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <Container>
        <nav className="flex h-18 items-center justify-between py-4">
          <Link href="/" className="focus-ring flex items-center gap-2">
            <Image src="/logo.png" alt={SITE.name} width={742} height={200} preload loading="eager" className="h-10 w-auto sm:h-12" />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {effectiveNavLinks.map((link) => {
              const hasDropdown = "dropdown" in link && link.dropdown;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => hasDropdown && (cancelClose(), setOpenDropdown(link.label))}
                  onMouseLeave={() => hasDropdown && scheduleClose()}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "focus-ring flex items-center gap-1 rounded-full px-4 py-2 text-lg font-medium transition-colors",
                      isActive
                        ? "text-[var(--color-paper)]"
                        : "text-[var(--color-muted)] hover:text-[var(--color-paper)]"
                    )}
                  >
                    {link.label}
                    {hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
                  </Link>

                  {hasDropdown && openDropdown === link.label && (
                    <div
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                      className="absolute left-0 top-full z-20 min-w-[200px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl shadow-black/30"
                    >
                      {link.dropdown!.map((item) => (
                        <Link
                          key={`${link.label}-${item.href}`}
                          href={item.href}
                          className="focus-ring block rounded-lg px-3 py-2 text-base text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-paper)]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden lg:block">
            <Button href="/get-a-quote" variant="primary">
              Let&apos;s Talk
            </Button>
          </div>

          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-paper)] lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </Container>
    </header>

      {/* Mobile menu — full-screen drawer sliding in from the right, with a
          dimmed backdrop and a pinned CTA. Rendered outside <header> so the
          scrolled header's backdrop-filter can't become its containing
          block and clip it. Always mounted so it can transition both ways;
          taps pass through when closed. */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-[var(--color-paper)]/30 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          id="mobile-menu"
          className={cn(
            "absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-[var(--color-border)] bg-[var(--color-ink)] pt-18 shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain border-t border-[var(--color-border)] px-5 pt-4 pb-6">
            {effectiveNavLinks.map((link) => {
              const hasDropdown = "dropdown" in link && link.dropdown;
              const isGroupOpen = openMobileGroup === link.label;
              return (
                <div key={link.href}>
                  <div className="flex items-center justify-between gap-1">
                    <Link
                      href={link.href}
                      className={cn(
                        "focus-ring flex min-h-[48px] flex-1 items-center rounded-lg px-3 text-base font-medium",
                        pathname === link.href
                          ? "bg-[var(--color-surface-raised)] text-[var(--color-paper)]"
                          : "text-[var(--color-muted)]"
                      )}
                    >
                      {link.label}
                    </Link>
                    {hasDropdown && (
                      <button
                        aria-label={`Toggle ${link.label} submenu`}
                        aria-expanded={isGroupOpen}
                        onClick={() => setOpenMobileGroup(isGroupOpen ? null : link.label)}
                        className="focus-ring flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)]"
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isGroupOpen && "rotate-180")} />
                      </button>
                    )}
                  </div>
                  {hasDropdown && isGroupOpen && (
                    <div className="mb-1 ml-3 flex flex-col gap-0.5 border-l border-[var(--color-border)] pl-3">
                      {link.dropdown!.map((item) => (
                        <Link
                          key={`${link.label}-${item.href}`}
                          href={item.href}
                          className="focus-ring flex min-h-[44px] items-center rounded-lg px-3 text-sm text-[var(--color-muted)]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="shrink-0 border-t border-[var(--color-border)] px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <Button href="/get-a-quote" variant="primary" className="w-full">
              Let&apos;s Talk
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
