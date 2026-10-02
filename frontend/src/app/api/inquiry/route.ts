import { NextResponse } from "next/server";
import { z } from "zod";
import { API_URL } from "@/sanity/env";
import { checkRateLimit, getRequestIp } from "@/lib/rateLimit";

// See src/app/api/contact/route.ts for why this is a separate schema from
// the client-side one, rather than importing it directly.
const payloadSchema = z.object({
  projectType: z.enum(["Web", "Mobile", "AI/ML", "Software", "UI/UX", "Other"]),
  budget: z.string().min(1),
  timeline: z.string().min(1),
  description: z.string().min(20),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().trim().max(30).optional(),
  company_website: z.string().optional(), // honeypot
});

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  if (!checkRateLimit(`inquiry:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the form and try again." },
      { status: 400 }
    );
  }

  if (parsed.data.company_website) {
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(`${API_URL}/api/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectType: parsed.data.projectType,
        budget: parsed.data.budget,
        timeline: parsed.data.timeline,
        description: parsed.data.description,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || undefined,
      }),
    });
    if (!res.ok) throw new Error(`Backend responded ${res.status}`);
  } catch (error) {
    console.error("[/api/inquiry] backend write failed:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong on our end. Please try again shortly." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
