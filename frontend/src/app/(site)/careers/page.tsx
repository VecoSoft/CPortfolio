import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import { sanityFetchList } from "@/sanity/fetch";
import { JOB_LIST_QUERY } from "@/sanity/queries";
import { fallbackJobs } from "@/sanity/fallbacks";
import type { JobDoc } from "@/sanity/types";
import { ArrowUpRight, MapPin, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join VecoSoft and help build the software behind ambitious businesses.",
};

export default async function CareersPage() {
  const fetched = await sanityFetchList<JobDoc>(JOB_LIST_QUERY, {}, { tags: ["job"] });
  cconst jobs: JobDoc[] = [];

  return (
    <div className="py-16 sm:py-24">
      <Container>
            <h1 className="text-fluid-hero mt-4 max-w-2xl font-medium text-[var(--color-paper)]">
          Build the future with VecoSoft.
        </h1>

        <div className="mt-16">
{jobs.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              No open positions right now — check back soon, or send your resume to info@vecosoft.com.
            </p>
          ) : (
            <div className="divide-y divide-[var(--color-border)] border-t border-b border-[var(--color-border)]">
              {jobs.map((job) => (
                <Link
                  key={job._id}
                  href={`/careers/${job.slug.current}`}
                  className="focus-ring group flex flex-col justify-between gap-4 py-6 sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="text-lg font-medium text-[var(--color-paper)]">{job.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted)]">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.type}</span>
                    </div>
                    {job.tags && job.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                      </div>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-[var(--color-cyan)]">
                    View Position
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
