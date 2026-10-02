import { Globe, Smartphone, BrainCircuit, Boxes, PenTool, Shapes, type LucideIcon } from "lucide-react";

// Same literals the quote schema (lib/validations/contact.ts) and the
// /api/inquiry route accept — the stored value never changes, only how
// it's presented.
export const SERVICE_IDS = ["Web", "Mobile", "AI/ML", "Software", "UI/UX", "Other"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export type ServiceInfo = {
  id: ServiceId;
  icon: LucideIcon;
  title: string;
  blurb: string;
  tags: string[];
};

// Copy mirrors the service descriptions in lib/constants.ts so the quote
// form never promises something the Services page doesn't.
export const SERVICES: Record<ServiceId, ServiceInfo> = {
  Web: {
    id: "Web",
    icon: Globe,
    title: "Websites & web apps",
    blurb: "Fast, scalable websites and web applications built on modern frameworks.",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
  },
  Mobile: {
    id: "Mobile",
    icon: Smartphone,
    title: "Mobile apps",
    blurb: "Native-feeling apps for iOS and Android from a single codebase.",
    tags: ["React Native", "iOS", "Android"],
  },
  "AI/ML": {
    id: "AI/ML",
    icon: BrainCircuit,
    title: "AI & machine learning",
    blurb: "Practical AI systems that automate work and surface real insight.",
    tags: ["Python", "LangChain", "Automation"],
  },
  Software: {
    id: "Software",
    icon: Boxes,
    title: "Custom software",
    blurb: "Purpose-built systems for workflows off-the-shelf tools can't handle.",
    tags: ["Node.js", "APIs", "Integrations"],
  },
  "UI/UX": {
    id: "UI/UX",
    icon: PenTool,
    title: "UI/UX design",
    blurb: "Interfaces designed around how people actually use software.",
    tags: ["Figma", "Design systems", "Accessibility"],
  },
  Other: {
    id: "Other",
    icon: Shapes,
    title: "Something else",
    blurb: "Not sure where it fits? Describe the problem and we'll help shape the right solution.",
    tags: ["Consulting", "Cloud & DevOps", "Audits"],
  },
};

// Shared with the 3D scenes. Blue is the accent, not the whole palette:
// most surfaces stay near-white so the page doesn't turn into a neon tank.
export const PALETTE = {
  deepNavy: "#0B1736",
  navy: "#132B63",
  royal: "#2563EB",
  electric: "#3B82F6",
  brand: "#2E5EFF",
  ice: "#EAF2FF",
  white: "#FFFFFF",
  mist: "#C9D8F0",
  cyan: "#7DD3FC",
} as const;
