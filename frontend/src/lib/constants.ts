// ─────────────────────────────────────────────────────────────
// Central content model. This stays as static data for now (Phase 1/2)
// but is shaped so it can be swapped for live Sanity queries in Phase 3
// without touching any page/component structure.
// ─────────────────────────────────────────────────────────────

export const SITE = {
  name: "VecoSoft",
  tagline: "Built for Scale. Engineered for Impact.",
  email: "info@vecosoft.com",
  location: "Dhaka, Bangladesh",
  // Canonical production origin — no trailing slash. Single source of truth
  // for metadataBase (layout.tsx) and the generated sitemap.xml/robots.txt
  // (see app/sitemap.ts, app/robots.ts), so the domain can never drift
  // out of sync between them.
  url: "https://www.vecosoft.com",
  social: {
    linkedin: "https://www.linkedin.com/company/vecosoft-bd/",
  },
};
// Temporary content toggles — company is pre-launch, so Solutions/
// Products/Work are hidden site-wide (nav, footer, homepage sections,
// and the routes themselves 404) until real content exists. Flip back
// to true here once real products/work/solutions are ready to show —
// nothing else needs to change.
export const FEATURES = {
  solutions: false,
  products: false,
  work: false,
};

// ── Navigation ──────────────────────────────────────────────

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Solutions", href: "/solutions" },
  {
    label: "Products",
    href: "/products",
    dropdown: [
      { label: "All Products", href: "/products" },
      // Individual category links are appended dynamically at render time
      // in Navbar.tsx (fetched from Sanity's productCategory collection) —
      // NOT hardcoded here, since a fixed list of category links wouldn't
      // scale with real data the way category-based filtering does. See
      // src/sanity/productCategories.ts.
    ],
  },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
];

// ── Status system (used across Products / Work) ────────

export type Status = "live" | "in-development" | "prototype" | "concept" | "research";

export const STATUS_LABEL: Record<Status, string> = {
  live: "Live",
  "in-development": "In Development",
  prototype: "Prototype",
  concept: "Concept",
  research: "Research",
};

// ── Image shape (thumbnail/hero/gallery placeholders) ─────────
// Real image assets get dropped in later; for now these are descriptive
// gradient tokens consumed by <MediaFrame /> so the layout never shifts
// once photography is added.

export type MediaRef = {
  // Restraint by design: stick to "electric" / "cyan" / "graphite" for
  // everyday use across products and work — these two carry the
  // brand's meaning (primary, secondary, neutral). "violet" and "amber"
  // exist for rare, deliberate emphasis only (e.g. a one-off highlight),
  // not as default rotation — a five-tone palette reads as decorative
  // rather than engineered.
  tone: "electric" | "cyan" | "violet" | "amber" | "graphite";
  label: string; // accessible description, doubles as alt text base
  // Which generative placeholder composition to render until real
  // photography/screenshots replace it: "ui" mimics a dashboard/app
  // screenshot, "diagram" mimics an architecture/workflow diagram,
  // "orbs" is an abstract brand visual. Defaults to "orbs".
  variant?: "ui" | "diagram" | "orbs";
};

export type ProjectImages = {
  thumbnail: MediaRef;
  heroImage: MediaRef;
  gallery: MediaRef[];
};

// ── Capability signal (hero strip) ─────────────────────────────

export const CAPABILITIES = ["Software", "AI", "Digital Products", "Automation", "Cloud", "Data"];

// ── What We Do (interactive rows) ──────────────────────────────

export type CapabilityRow = {
  index: string;
  title: string;
  tags: string[];
  description: string;
  href: string;
};

// Deliberately mirrors SERVICES below, one-to-one (same name, same slug) —
// this is the homepage-scale summary of the exact same six services, not a
// separately-invented list. Keeping it in lockstep avoids the site showing
// two different names/counts for what a visitor experiences as one offering.
export const WHAT_WE_DO: CapabilityRow[] = [
  {
    index: "01",
    title: "Web Development",
    tags: ["Web platforms", "Enterprise systems"],
    description: "Fast, scalable websites and web applications built on modern frameworks.",
    href: "/services/web-development",
  },
  {
    index: "02",
    title: "AI & Machine Learning",
    tags: ["ML", "AI applications", "Automation"],
    description: "Practical AI systems that automate work and surface real insight.",
    href: "/services/ai-machine-learning",
  },
  {
    index: "03",
    title: "Mobile App Development",
    tags: ["iOS", "Android", "Cross-platform"],
    description: "Native-feeling apps for iOS and Android from a single codebase.",
    href: "/services/mobile-development",
  },
  {
    index: "04",
    title: "UI/UX Design",
    tags: ["Research", "Design systems", "Prototyping"],
    description: "Interfaces designed around how people actually use software.",
    href: "/services/ui-ux-design",
  },
  {
    index: "05",
    title: "Cloud & DevOps",
    tags: ["APIs", "Deployment", "Scalability"],
    description: "Infrastructure and pipelines that keep software fast and reliable.",
    href: "/services/cloud-devops",
  },
  {
    index: "06",
    title: "Custom Software",
    tags: ["Workflows", "Integrations", "Internal tools"],
    description: "Purpose-built systems for workflows off-the-shelf tools can't handle.",
    href: "/services/custom-software",
  },
];

// ── Services (deep-dive detail pages) ───────────────────────────

export type Service = {
  slug: string;
  name: string;
  shortDescription: string;
  icon: string;
  problems: string[];
  features: string[];
  technologies: string[];
  process: { title: string; description: string }[];
  deliverables: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "web-development",
    name: "Web Development",
    shortDescription: "Fast, scalable websites and web applications built on modern frameworks.",
    icon: "Code2",
    problems: [
      "Outdated or slow websites that hurt conversion",
      "Platforms that can't scale with business growth",
      "Poor SEO foundations limiting discoverability",
    ],
    features: [
      "Custom design systems, not templates",
      "Server-rendered performance out of the box",
      "CMS-driven content your team can manage",
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    process: [
      { title: "Discover", description: "We map your goals, users, and technical constraints." },
      { title: "Design", description: "Wireframes and visual design tailored to your brand." },
      { title: "Develop", description: "Component-driven build with continuous review." },
      { title: "Launch", description: "Testing, optimization, and a monitored go-live." },
    ],
    deliverables: ["Production-ready codebase", "CMS access", "Deployment & documentation"],
  },
  {
    slug: "ai-machine-learning",
    name: "AI & Machine Learning",
    shortDescription: "Practical AI systems that automate work and surface real insight.",
    icon: "BrainCircuit",
    problems: [
      "Manual processes that don't scale",
      "Data that isn't turned into decisions",
      "Uncertainty about where AI actually helps",
    ],
    features: [
      "Workflow automation with LLMs",
      "Custom model integration & fine-tuning",
      "Data pipelines built for reliability",
    ],
    technologies: ["Python", "PyTorch", "LangChain", "PostgreSQL"],
    process: [
      { title: "Assess", description: "We identify high-value automation opportunities." },
      { title: "Prototype", description: "A working proof of concept, fast." },
      { title: "Build", description: "Production-grade implementation with guardrails." },
      { title: "Monitor", description: "Ongoing evaluation and iteration." },
    ],
    deliverables: ["Working AI system", "Evaluation dashboard", "Handover documentation"],
  },
  {
    slug: "mobile-development",
    name: "Mobile App Development",
    shortDescription: "Native-feeling apps for iOS and Android from a single codebase.",
    icon: "Smartphone",
    problems: [
      "Slow, inconsistent cross-platform apps",
      "High cost of maintaining two native codebases",
      "Poor offline and performance experience",
    ],
    features: [
      "Cross-platform builds with native performance",
      "Push notifications & offline support",
      "App store submission handled end-to-end",
    ],
    technologies: ["React Native", "TypeScript", "Node.js"],
    process: [
      { title: "Plan", description: "Define scope, platforms, and release strategy." },
      { title: "Design", description: "Mobile-first interface built for real usage." },
      { title: "Build", description: "Iterative development with device testing." },
      { title: "Ship", description: "Store submission and post-launch support." },
    ],
    deliverables: ["iOS & Android builds", "Source code", "Store listing assets"],
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX Design",
    shortDescription: "Interfaces designed around how people actually use software.",
    icon: "PenTool",
    problems: [
      "Confusing flows that increase support load",
      "Inconsistent visual language across a product",
      "Designs that don't hold up on real devices",
    ],
    features: [
      "User research & flow mapping",
      "Design systems built for reuse",
      "Prototyping and usability testing",
    ],
    technologies: ["Figma", "Design Tokens", "Accessibility Standards"],
    process: [
      { title: "Research", description: "Understand users, competitors, and constraints." },
      { title: "Wireframe", description: "Structure before style." },
      { title: "Design", description: "High-fidelity, on-brand interface design." },
      { title: "Test", description: "Validate with real users before build." },
    ],
    deliverables: ["Design system", "Interactive prototype", "Developer handoff files"],
  },
  {
    slug: "cloud-devops",
    name: "Cloud & DevOps",
    shortDescription: "Infrastructure and pipelines that keep software fast and reliable.",
    icon: "Cloud",
    problems: [
      "Manual, error-prone deployments",
      "Downtime during traffic spikes",
      "No visibility into system health",
    ],
    features: [
      "CI/CD pipeline setup",
      "Infrastructure as code",
      "Monitoring & alerting",
    ],
    technologies: ["AWS", "Docker", "GitHub Actions", "Vercel"],
    process: [
      { title: "Audit", description: "Review current infrastructure and risks." },
      { title: "Design", description: "Architect for scale and resilience." },
      { title: "Implement", description: "Automate deployment and monitoring." },
      { title: "Support", description: "Ongoing reliability and cost review." },
    ],
    deliverables: ["CI/CD pipeline", "Infrastructure documentation", "Monitoring setup"],
  },
  {
    slug: "custom-software",
    name: "Custom Software",
    shortDescription: "Purpose-built systems for workflows off-the-shelf tools can't handle.",
    icon: "Settings2",
    problems: [
      "Generic software forcing awkward workarounds",
      "Disconnected tools and duplicate data entry",
      "Growing operational complexity",
    ],
    features: [
      "Requirements-driven architecture",
      "Integrations with existing tools",
      "Built to scale with your operations",
    ],
    technologies: ["Node.js", "PostgreSQL", "TypeScript"],
    process: [
      { title: "Discover", description: "Deep dive into your operational workflow." },
      { title: "Architect", description: "Design a system that fits, not forces." },
      { title: "Build", description: "Iterative delivery with regular check-ins." },
      { title: "Support", description: "Long-term maintenance and evolution." },
    ],
    deliverables: ["Custom application", "Technical documentation", "Training & handover"],
  },
];

// ── Solutions (industry / outcome-oriented bundles of services) ─

export type Solution = {
  slug: string;
  name: string;
  shortDescription: string;
  outcomes: string[];
  relatedServices: string[]; // service slugs
};

export const SOLUTIONS: Solution[] = [
  {
    slug: "product-development",
    name: "Product Development",
    shortDescription: "Take a product from zero to a system real users depend on.",
    outcomes: [
      "A working product built on validated architecture",
      "A roadmap for post-launch iteration",
      "A team that understands your codebase, not just your demo",
    ],
    relatedServices: ["web-development", "ui-ux-design", "cloud-devops"],
  },
  {
    slug: "ai-automation",
    name: "AI Automation",
    shortDescription: "Replace manual, repetitive work with reliable AI-driven workflows.",
    outcomes: [
      "Hours saved per week on repetitive operational tasks",
      "AI systems with human review built in, not black boxes",
      "A clear view of what's automated and why",
    ],
    relatedServices: ["ai-machine-learning", "custom-software"],
  },
  {
    slug: "digital-transformation",
    name: "Digital Transformation",
    shortDescription: "Modernize legacy processes into connected, maintainable software.",
    outcomes: [
      "Legacy workflows replaced with maintainable systems",
      "Reduced operational overhead from disconnected tools",
      "A platform your team can extend without an agency",
    ],
    relatedServices: ["custom-software", "cloud-devops"],
  },
];

// ── Products: VecoSoft's own concept platforms ──────────────────

export type Product = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  status: Status;
  description: string;
  problem: string;
  idea: string;
  howItWorks: { step: string; description: string }[];
  features: { title: string; description: string }[];
  technologies: { group: string; items: string[] }[];
  useCases: string[];
  roadmap: string[];
  images: ProjectImages;
  size: "wide" | "tall" | "large" | "standard"; // showcase grid sizing
};

export const PRODUCTS: Product[] = [
  {
    slug: "veco-ai",
    name: "VecoAI",
    category: "AI Platform",
    tagline: "Intelligence, built for business.",
    status: "in-development",
    description:
      "A concept platform for automating repetitive business workflows using configurable AI agents.",
    problem:
      "Businesses generate enormous amounts of data, but turning that data into useful decisions remains difficult. Teams lose hours each week to repetitive, manual operational tasks that no one has time to automate properly.",
    idea: "What if intelligence could become part of every workflow — not bolted on, but built in from the start?",
    howItWorks: [
      { step: "Input", description: "A workflow is defined once, in plain language or a visual builder." },
      { step: "AI Engine", description: "Configurable agents interpret the task and plan the steps needed." },
      { step: "Processing", description: "Each step runs with guardrails and a full audit trail." },
      { step: "Insight", description: "Results are surfaced to the right person, at the right moment." },
      { step: "Action", description: "A human reviews and confirms before anything ships." },
    ],
    features: [
      { title: "Visual workflow builder", description: "Design automations without writing code." },
      { title: "Human-in-the-loop review", description: "Every AI action can be checked before it takes effect." },
      { title: "Audit trail for every action", description: "Full traceability for compliance and debugging." },
    ],
    technologies: [
      { group: "Frontend", items: ["Next.js", "React", "TypeScript"] },
      { group: "AI", items: ["Python", "PyTorch", "LangChain"] },
      { group: "Data", items: ["PostgreSQL"] },
    ],
    useCases: ["Customer support triage", "Document processing", "Internal reporting"],
    roadmap: ["Core workflow engine", "Multi-agent orchestration", "Marketplace of prebuilt automations"],
    images: {
      thumbnail: { tone: "electric", label: "VecoAI workflow builder interface", variant: "orbs" },
      heroImage: { tone: "electric", label: "VecoAI dashboard overview", variant: "ui" },
      gallery: [
        { tone: "electric", label: "Workflow builder canvas", variant: "ui" },
        { tone: "cyan", label: "Automation run history", variant: "diagram" },
        { tone: "graphite", label: "Audit trail detail view", variant: "ui" },
      ],
    },
    size: "large",
  },
  {
    slug: "veco-hr",
    name: "VecoHR",
    category: "HR Platform",
    tagline: "People operations, without the overhead.",
    status: "prototype",
    description: "A concept HR platform covering the employee lifecycle from hiring to offboarding.",
    problem:
      "Growing teams outgrow spreadsheets fast, but most are nowhere near ready for the cost and complexity of enterprise HR suites built for thousands of employees.",
    idea: "A lightweight system that grows with a team instead of forcing them to grow around it.",
    howItWorks: [
      { step: "Setup", description: "Define roles, departments, and leave policies once." },
      { step: "Hire", description: "Track applicants through a simple pipeline." },
      { step: "Manage", description: "Leave, attendance, and reviews live in one place." },
      { step: "Report", description: "Team-wide visibility without spreadsheets." },
    ],
    features: [
      { title: "Applicant tracking", description: "A simple pipeline from application to offer." },
      { title: "Leave & attendance", description: "Self-service requests with manager approval." },
      { title: "Performance reviews", description: "Structured, recurring review cycles." },
    ],
    technologies: [
      { group: "Frontend", items: ["Next.js", "TypeScript"] },
      { group: "Backend", items: ["Node.js"] },
      { group: "Data", items: ["PostgreSQL"] },
    ],
    useCases: ["Recruitment pipelines", "Remote team management", "Performance cycles"],
    roadmap: ["Core HR modules", "Payroll integration", "Self-service employee portal"],
    images: {
      thumbnail: { tone: "cyan", label: "VecoHR employee dashboard", variant: "orbs" },
      heroImage: { tone: "cyan", label: "VecoHR team overview screen", variant: "ui" },
      gallery: [
        { tone: "cyan", label: "Applicant pipeline board", variant: "ui" },
        { tone: "electric", label: "Leave request flow", variant: "diagram" },
      ],
    },
    size: "standard",
  },
  {
    slug: "veco-learn",
    name: "VecoLearn",
    category: "Learning Platform",
    tagline: "Training that's actually measured.",
    status: "concept",
    description: "A concept platform for building and tracking internal training programs.",
    problem: "Companies struggle to deliver and measure consistent internal training across growing teams.",
    idea: "Structured courses with real completion data, not a shared folder of PDFs nobody opens.",
    howItWorks: [
      { step: "Build", description: "Assemble a course from modules, quizzes, and resources." },
      { step: "Assign", description: "Push training to individuals, teams, or new hires automatically." },
      { step: "Track", description: "See completion and comprehension in real time." },
      { step: "Certify", description: "Generate certificates on completion." },
    ],
    features: [
      { title: "Course builder", description: "Modular course creation with no code required." },
      { title: "Progress tracking", description: "Real-time visibility into completion and scores." },
      { title: "Certification generation", description: "Automatic, shareable certificates." },
    ],
    technologies: [
      { group: "Frontend", items: ["Next.js"] },
      { group: "Data", items: ["PostgreSQL"] },
      { group: "Storage", items: ["Cloud Storage"] },
    ],
    useCases: ["Employee onboarding", "Compliance training", "Skill certification"],
    roadmap: ["Course builder MVP", "Analytics dashboard", "Mobile learning app"],
    images: {
      thumbnail: { tone: "graphite", label: "VecoLearn course builder", variant: "orbs" },
      heroImage: { tone: "graphite", label: "VecoLearn course catalog", variant: "ui" },
      gallery: [{ tone: "graphite", label: "Progress tracking dashboard", variant: "ui" }],
    },
    size: "standard",
  },
  {
    slug: "veco-analytics",
    name: "VecoAnalytics",
    category: "Business Intelligence",
    tagline: "Data, turned into decisions.",
    status: "concept",
    description: "A concept BI tool for turning operational data into decisions.",
    problem: "Business data is scattered across tools and rarely reaches decision-makers in time to matter.",
    idea: "Live dashboards that connect directly to the tools a business already runs on.",
    howItWorks: [
      { step: "Connect", description: "Link existing data sources — no migration required." },
      { step: "Model", description: "Define the metrics that matter to your business." },
      { step: "Visualize", description: "Live dashboards update as new data arrives." },
      { step: "Share", description: "Role-based access keeps reports relevant to each team." },
    ],
    features: [
      { title: "Live dashboards", description: "Data updates in real time, not on a weekly export." },
      { title: "Custom reports", description: "Build reports around your own metrics." },
      { title: "Role-based access", description: "Everyone sees exactly what's relevant to them." },
    ],
    technologies: [
      { group: "Frontend", items: ["Next.js"] },
      { group: "Backend", items: ["Python"] },
      { group: "Data", items: ["PostgreSQL"] },
    ],
    useCases: ["Executive reporting", "Sales performance tracking", "Operational monitoring"],
    roadmap: ["Core dashboard engine", "Data source integrations", "Custom alerting"],
    images: {
      thumbnail: { tone: "cyan", label: "VecoAnalytics dashboard", variant: "orbs" },
      heroImage: { tone: "cyan", label: "VecoAnalytics reporting overview", variant: "ui" },
      gallery: [{ tone: "cyan", label: "Custom report builder", variant: "ui" }],
    },
    size: "tall",
  },
];

// ── Work: client / real project case studies ────────────────────
// Intentionally starts empty — no fabricated results are shown.
// Add real engagements here as they're completed and cleared for publishing.

export type CaseStudy = {
  slug: string;
  title: string;
  client: string;
  industry: string;
  status: Status;
  summary: string;
  challenge: string;
  approach: string[];
  solution: string;
  architecture: string;
  result: string;
  technologies: string[];
  images: ProjectImages;
  size: "wide" | "tall" | "large" | "standard";
};

export const CASE_STUDIES: CaseStudy[] = [];

// ── Why VecoSoft ──────────────────────────────────────────────

export const WHY_VICOSOFT = [
  { title: "Innovation", description: "We build with current technology and current thinking, not last decade's stack." },
  { title: "Performance", description: "Fast, scalable solutions engineered to hold up under real usage." },
  { title: "Security", description: "Security-conscious development from the first commit, not an afterthought." },
  { title: "Quality", description: "Maintainable, well-documented software your team can build on." },
  { title: "Partnership", description: "We work as an extension of your team, not a one-off vendor." },
  { title: "User Focus", description: "Every decision is filtered through how real users will experience it." },
];

// ── Team ─────────────────────────────────────────────────────────
// Fallback only — the live site pulls from Sanity's `teamMember`
// documents once added in Studio, including photo uploads. This array
// is what renders before any real team member is added there, and
// scales the same way as everything else: add more entries here (or in
// Sanity) and the section grows accordingly, not fixed to 3 people.
export const TEAM_MEMBERS = [
  {
    slug: "founder-ceo",
    name: "Founder Name",
    role: "Founder & CEO",
    quote:
      "We started VecoSoft because too much software gets shipped fast and forgotten. We'd rather build fewer things and build them properly — with architecture that holds up as a business grows, not just at launch.",
  },
  {
    slug: "chairman",
    name: "Chairman Name",
    role: "Chairman",
    quote:
      "Good technology partnerships are built on trust before they're built on code. Our job is to be the kind of partner a business can rely on for the long run, not just the next release.",
  },
  {
    slug: "co-founder",
    name: "Co-Founder Name",
    role: "Co-Founder & Owner",
    quote:
      "Every project we take on is one we'd be proud to put our name on years later — that's the bar, on every engagement, regardless of size.",
  },
];

// ── Technology stack (grouped) ───────────────────────────────────

export const TECH_STACK_GROUPS = [
  {
    group: "Frame Works",
    items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Django", "FastAPI", "REST APIs", "Spring Boot", "PHP Laravel"],
  },
  { group: "Mobile App", items: ["React Native", "Flutter", "Swift", "Kotlin"] },
  { group: "Artificial Intelligence", items: ["Python", "PyTorch", "scikit-learn Machine Learning", "Natural Language Processing", "Deep Learning"] },
  { group: "DevOps", items: ["Docker", "AWS", "DigitalOcean", "Kubernetes"] },
  { group: "Design", items: ["Figma", "UI/UX Design", "Design Systems", "Prototyping"] },
];

export const TECH_STACK = TECH_STACK_GROUPS.flatMap((g) => g.items);

// ── How we work ───────────────────────────────────────────────

export const HOW_WE_WORK = [
  { title: "Discover", description: "We learn your goals, users, and constraints before writing a proposal.", checkpoint: "Discovery call & scope alignment" },
  { title: "Plan", description: "A clear proposal with timeline, cost, and technical approach.", checkpoint: "Proposal review with you" },
  { title: "Design", description: "Wireframes and visual design tailored to your brand and users.", checkpoint: "Design walkthrough & feedback" },
  { title: "Develop", description: "Iterative development with regular progress updates.", checkpoint: "Sprint demos" },
  { title: "Test", description: "Functional, performance, and usability testing before launch.", checkpoint: "QA sign-off" },
  { title: "Deploy", description: "A monitored, controlled go-live.", checkpoint: "Launch confirmation" },
  { title: "Support", description: "A defined post-launch support window included with every project.", checkpoint: "Ongoing check-ins" },
];

// ── FAQ ───────────────────────────────────────────────────────

export const FAQS = [
  {
    question: "What services does VecoSoft provide?",
    answer:
      "We build web platforms, mobile apps, AI-driven systems, custom software, and provide UI/UX design and cloud/DevOps support end-to-end.",
  },
  {
    question: "What technologies do you use?",
    answer:
      "Primarily Next.js, TypeScript, Node.js, Python, and PostgreSQL — chosen for performance, maintainability, and long-term support.",
  },
  {
    question: "Do you work with international clients?",
    answer: "Yes. We work remotely with clients across time zones and adapt communication to fit your schedule.",
  },
  {
    question: "How does a project start?",
    answer:
      "With a short discovery call to understand your goals, followed by a scoped proposal before any development begins.",
  },
  {
    question: "How long does development take?",
    answer:
      "It depends on scope — a focused website may take 3-4 weeks, while a full product build can take several months. We'll give you a realistic timeline after discovery.",
  },
  {
    question: "Do you provide maintenance after launch?",
    answer: "Yes, we offer post-launch support and ongoing maintenance packages tailored to your needs.",
  },
];

// ── Trust commitments ─────────────────────────────────────────

export const OUR_COMMITMENTS = [
  { title: "Speed Without Compromise", description: "From concept to launch in weeks, not months — so you validate your idea in the real market while competitors are still writing specs." },
  { title: "Cost Certainty, Guaranteed", description: "Fixed milestones. Fixed pricing. Zero surprises. You know exactly what you're paying for and exactly when it ships — every time." },
  { title: "Engineering That Scales With You", description: "Built on enterprise-grade, future-proof architecture designed to handle 10x growth — without a costly rewrite down the line." },
  { title: "A Partner, Not a Vendor", description: "We stay engaged after go-live with SLA-backed monitoring and support, because our reputation is tied to your product staying up." },
];

// ── Careers ───────────────────────────────────────────────────

export type Job = {
  slug: string;
  title: string;
  location: string;
  type: string;
  experience: string;
  duration?: string;
  stipend?: string;
  tags: string[];
  about: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
};

export const JOBS: Job[] = [
  {
    slug: "frontend-developer",
    title: "Frontend Developer",
    location: "Dhaka / Remote",
    type: "Full-time",
    experience: "2+ years",
    tags: ["React", "Next.js", "TypeScript"],
    about: "Build and maintain client-facing interfaces across our product and client projects.",
    responsibilities: [
      "Implement responsive, accessible UI from design specs",
      "Collaborate with backend engineers on API integration",
      "Maintain and improve our shared component library",
    ],
    requirements: [
      "Strong experience with React and TypeScript",
      "Familiarity with Next.js App Router",
      "Understanding of responsive, accessible design",
    ],
    niceToHave: ["Experience with Tailwind CSS", "Exposure to design tools like Figma"],
    benefits: ["Flexible remote work", "Growth-focused team", "Modern tech stack"],
  },
  {
    slug: "backend-developer",
    title: "Backend Developer",
    location: "Dhaka / Remote",
    type: "Full-time",
    experience: "2+ years",
    tags: ["Node.js", "PostgreSQL", "APIs"],
    about: "Design and build reliable backend systems powering our web and product platforms.",
    responsibilities: [
      "Design and implement REST/GraphQL APIs",
      "Model and optimize PostgreSQL schemas",
      "Own reliability and security of backend services",
    ],
    requirements: [
      "Strong experience with Node.js",
      "Solid understanding of relational databases",
      "Familiarity with authentication & authorization patterns",
    ],
    niceToHave: ["Experience with cloud deployment (AWS/Vercel)", "Interest in AI/ML integrations"],
    benefits: ["Flexible remote work", "Growth-focused team", "Modern tech stack"],
  },
];
