/**
 * Central content-model definition — the Postgres/Node equivalent of the old
 * `sanity/schemaTypes/*` files. Each entry drives THREE things at once:
 *   1. The generic admin CRUD API   (src/controllers/adminController.js)
 *   2. The generic admin panel UI   (src/views/admin/list.ejs / form.ejs)
 *   3. Column selection for the public read API (src/controllers/publicController.js)
 *
 * Field `type` values:
 *   text     -> single-line <input>
 *   textarea -> multi-line <textarea>
 *   number   -> <input type=number>
 *   boolean  -> checkbox
 *   date     -> <input type=date>
 *   select   -> <select> with `options: [{value,label}]`
 *   slug     -> auto-derived from `slugSource` field but editable
 *   array    -> string[] stored as JSONB, edited as one-item-per-line textarea
 *   json     -> arbitrary structured JSONB (mediaRef/featureItem/etc groups),
 *               edited as a raw-JSON textarea with a `hint` shown to the editor
 *   image    -> file upload -> stores the resulting /uploads URL as text
 *   reference -> foreign key -> <select> populated from `refResource`
 */

const STATUS_OPTIONS = [
  { value: "live", label: "Live" },
  { value: "in-development", label: "In Development" },
  { value: "prototype", label: "Prototype" },
  { value: "concept", label: "Concept" },
  { value: "research", label: "Research" },
];

const GRID_SIZE_OPTIONS = [
  { value: "standard", label: "Standard (1x1)" },
  { value: "wide", label: "Wide (2x1)" },
  { value: "tall", label: "Tall (1x2)" },
  { value: "large", label: "Large (2x2)" },
];

const LEAD_STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in-progress", label: "In Progress" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
  { value: "archived", label: "Archived" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const APPLICATION_STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
  { value: "archived", label: "Archived" },
];

const ICON_OPTIONS = [
  { value: "Code2", label: "Code2 (Web Development)" },
  { value: "BrainCircuit", label: "BrainCircuit (AI & ML)" },
  { value: "Smartphone", label: "Smartphone (Mobile)" },
  { value: "PenTool", label: "PenTool (UI/UX)" },
  { value: "Cloud", label: "Cloud (Cloud & DevOps)" },
  { value: "Settings2", label: "Settings2 (Custom Software)" },
];

const IMAGES_HINT = JSON.stringify(
  {
    thumbnail: { label: "Alt text", imageUrl: "/uploads/example.jpg", tone: "electric", variant: "orbs" },
    heroImage: { label: "Alt text", imageUrl: "/uploads/example.jpg", tone: "electric", variant: "orbs" },
    gallery: [{ label: "Alt text", imageUrl: "/uploads/example.jpg", tone: "cyan", variant: "ui" }],
  },
  null,
  2
);

const resources = {
  services: {
    table: "services",
    label: "Services",
    singular: "Service",
    slugField: "slug",
    slugSource: "name",
    orderBy: "display_order asc nulls last, id asc",
    listColumns: ["id", "name", "slug", "short_description", "icon", "display_order"],
    publicColumns: ["id", "name", "slug", "short_description", "icon"],
    publicDetailColumns: [
      "id", "name", "slug", "short_description", "icon",
      "problems", "features", "technologies", "process", "deliverables",
    ],
    fields: [
      { name: "name", type: "text", required: true },
      { name: "slug", type: "slug", required: true },
      { name: "short_description", label: "Short description", type: "textarea", required: true },
      { name: "icon", type: "select", options: ICON_OPTIONS, required: true },
      { name: "problems", label: "Problems we solve", type: "array", required: true },
      { name: "features", label: "What you get", type: "array", required: true },
      { name: "technologies", type: "array", required: true },
      { name: "process", label: "Our process", type: "json", hint: '[{"title":"Discover","description":"..."}]' },
      { name: "deliverables", type: "array", required: true },
      { name: "display_order", label: "Display order", type: "number" },
    ],
  },

  solutions: {
    table: "solutions",
    label: "Solutions",
    singular: "Solution",
    slugField: "slug",
    slugSource: "name",
    orderBy: "display_order asc nulls last, id asc",
    listColumns: ["id", "name", "slug", "short_description", "display_order"],
    publicColumns: ["id", "name", "slug", "short_description"],
    publicDetailColumns: ["id", "name", "slug", "short_description", "outcomes", "related_service_ids"],
    fields: [
      { name: "name", type: "text", required: true },
      { name: "slug", type: "slug", required: true },
      { name: "short_description", label: "Short description", type: "textarea", required: true },
      { name: "outcomes", label: "What you get", type: "array", required: true },
      {
        name: "related_service_ids", label: "Related services", type: "multiref",
        refResource: "services", refLabel: "name",
      },
      { name: "display_order", label: "Display order", type: "number" },
    ],
  },

  product_categories: {
    table: "product_categories",
    label: "Product Categories",
    singular: "Product Category",
    slugField: "slug",
    slugSource: "name",
    orderBy: "display_order asc nulls last, id asc",
    listColumns: ["id", "name", "slug", "display_order"],
    publicColumns: ["id", "name", "slug"],
    fields: [
      { name: "name", type: "text", required: true },
      { name: "slug", type: "slug", required: true },
      { name: "display_order", label: "Display order", type: "number" },
    ],
  },

  products: {
    table: "products",
    label: "Products",
    singular: "Product",
    slugField: "slug",
    slugSource: "name",
    orderBy: "display_order asc nulls last, id asc",
    listColumns: ["id", "name", "slug", "status", "featured", "display_order"],
    publicColumns: ["id", "name", "slug", "tagline", "status", "description", "category_id", "images", "size", "featured"],
    publicDetailColumns: [
      "id", "name", "slug", "category_id", "tagline", "status", "description", "problem", "idea",
      "how_it_works", "features", "technologies", "use_cases", "roadmap", "images", "size", "featured", "display_order",
    ],
    fields: [
      { name: "name", type: "text", required: true },
      { name: "slug", type: "slug", required: true },
      { name: "category_id", label: "Category", type: "reference", refResource: "product_categories", refLabel: "name", required: true },
      { name: "tagline", type: "text", required: true },
      { name: "status", type: "select", options: STATUS_OPTIONS, required: true },
      { name: "description", type: "textarea", required: true },
      { name: "problem", label: "The Problem", type: "textarea", required: true },
      { name: "idea", label: "The Idea", type: "textarea", required: true },
      { name: "how_it_works", label: "How it works (steps)", type: "json", required: true, hint: '[{"step":"Input","description":"..."}]' },
      { name: "features", label: "Key features", type: "json", required: true, hint: '[{"title":"Fast","description":"..."}]' },
      { name: "technologies", label: "Technology (grouped)", type: "json", required: true, hint: '[{"group":"Backend","items":["Node.js","Postgres"]}]' },
      { name: "use_cases", label: "Use cases", type: "array", required: true },
      { name: "roadmap", label: "Future roadmap", type: "array" },
      { name: "images", type: "json", required: true, hint: IMAGES_HINT },
      { name: "size", label: "Grid tile size", type: "select", options: GRID_SIZE_OPTIONS, required: true },
      { name: "featured", type: "boolean" },
      { name: "display_order", label: "Display order", type: "number" },
    ],
  },

  case_studies: {
    table: "case_studies",
    label: "Case Studies (Work)",
    singular: "Case Study",
    slugField: "slug",
    slugSource: "title",
    orderBy: "published_at desc nulls last, id desc",
    listColumns: ["id", "title", "slug", "client", "status", "client_approved"],
    publicColumns: ["id", "title", "slug", "client", "industry", "status", "summary", "images", "size", "featured", "published_at"],
    publicDetailColumns: [
      "id", "title", "slug", "client", "industry", "status", "summary", "challenge", "approach", "solution",
      "architecture", "result", "technologies", "images", "size", "featured", "published_at", "client_approved",
    ],
    publicOnlyWhere: "client_approved = true",
    fields: [
      { name: "title", type: "text", required: true },
      { name: "slug", type: "slug", required: true },
      { name: "client", type: "text", required: true },
      { name: "industry", type: "text", required: true },
      { name: "status", type: "select", options: STATUS_OPTIONS, required: true },
      { name: "summary", type: "textarea", required: true },
      { name: "challenge", type: "textarea", required: true },
      { name: "approach", label: "Our approach", type: "array", required: true },
      { name: "solution", type: "textarea", required: true },
      { name: "architecture", type: "textarea", required: true },
      { name: "result", type: "textarea", required: true, hint: "Only publish results that are real and verifiable — no invented metrics." },
      { name: "technologies", type: "array", required: true },
      { name: "images", type: "json", required: true, hint: IMAGES_HINT },
      { name: "size", label: "Grid tile size", type: "select", options: GRID_SIZE_OPTIONS, required: true },
      { name: "featured", type: "boolean" },
      { name: "published_at", label: "Published date", type: "date" },
      {
        name: "client_approved", label: "Client approved for publishing", type: "boolean",
        hint: "Distinct from 'live' status above — keep OFF until the client has actually signed off on this being public.",
      },
    ],
  },

  experiments: {
    table: "experiments",
    label: "Experiments (Labs)",
    singular: "Experiment",
    slugField: "slug",
    slugSource: "title",
    orderBy: "display_order asc nulls last, id asc",
    listColumns: ["id", "title", "slug", "category", "status", "featured"],
    publicColumns: ["id", "title", "slug", "category", "status", "summary", "images", "size", "featured"],
    publicDetailColumns: ["id", "title", "slug", "category", "status", "summary", "description", "technologies", "images", "size", "featured", "display_order"],
    fields: [
      { name: "title", type: "text", required: true },
      { name: "slug", type: "slug", required: true },
      { name: "category", type: "text", required: true },
      { name: "status", type: "select", options: STATUS_OPTIONS, required: true },
      { name: "summary", type: "textarea", required: true },
      { name: "description", type: "textarea", required: true },
      { name: "technologies", type: "array", required: true },
      { name: "images", type: "json", required: true, hint: IMAGES_HINT },
      { name: "size", label: "Grid tile size", type: "select", options: GRID_SIZE_OPTIONS, required: true },
      { name: "display_order", label: "Display order", type: "number" },
      { name: "featured", type: "boolean" },
    ],
  },

  jobs: {
    table: "jobs",
    label: "Jobs",
    singular: "Job",
    slugField: "slug",
    slugSource: "title",
    orderBy: "created_at desc",
    listColumns: ["id", "title", "slug", "location", "status", "deadline"],
    publicColumns: ["id", "title", "slug", "location", "type", "experience", "duration", "stipend", "tags", "status", "deadline"],
    publicDetailColumns: [
      "id", "title", "slug", "location", "type", "experience", "duration", "stipend", "tags", "about", "responsibilities",
      "requirements", "nice_to_have", "benefits", "status", "deadline",
    ],
    publicListOnlyWhere: "status = 'open'",
    fields: [
      { name: "title", type: "text", required: true },
      { name: "slug", type: "slug", required: true },
      { name: "location", type: "text", required: true },
      { name: "type", label: "Employment type", type: "select", options: ["Full-time", "Part-time", "Contract", "Internship"].map((v) => ({ value: v, label: v })), required: true },
      { name: "experience", type: "text", required: true },
      { name: "duration", type: "text", hint: 'e.g. "2 months" — mainly for internships; leave blank for full-time roles.' },
      { name: "stipend", type: "text", hint: 'e.g. "Unpaid" or "৳15,000/month" — mainly for internships; leave blank for full-time roles.' },
      { name: "tags", type: "array", hint: "Short skill tags shown on the job card (e.g. React, Next.js, TypeScript)." },
      { name: "about", type: "textarea", required: true },
      { name: "responsibilities", type: "array", required: true },
      { name: "requirements", type: "array", required: true },
      { name: "nice_to_have", label: "Nice to have", type: "array" },
      { name: "benefits", type: "array" },
      { name: "status", type: "select", options: [{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }], required: true },
      { name: "deadline", label: "Application deadline", type: "date" },
    ],
  },

  faqs: {
    table: "faqs",
    label: "FAQs",
    singular: "FAQ",
    orderBy: "display_order asc nulls last, id asc",
    listColumns: ["id", "question", "display_order"],
    publicColumns: ["id", "question", "answer", "display_order"],
    fields: [
      { name: "question", type: "text", required: true },
      { name: "answer", type: "textarea", required: true },
      { name: "display_order", label: "Display order", type: "number", hint: "Lower numbers appear first in the FAQ accordion." },
    ],
  },

  team_members: {
    table: "team_members",
    label: "Team Members",
    singular: "Team Member",
    orderBy: "display_order asc nulls last, id asc",
    listColumns: ["id", "name", "role", "display_order"],
    publicColumns: ["id", "name", "role", "photo_url", "quote", "linkedin", "display_order"],
    fields: [
      { name: "name", type: "text", required: true },
      { name: "role", label: "Role / Title", type: "text", required: true },
      { name: "photo_url", label: "Photo", type: "image", required: true },
      { name: "quote", label: "Quote / Bio", type: "textarea", required: true },
      { name: "linkedin", label: "LinkedIn URL", type: "text" },
      { name: "display_order", label: "Display order", type: "number" },
    ],
  },

  // ---- Private / operational (submitted by visitors, managed by admins) ----

  contact_messages: {
    table: "contact_messages",
    label: "Contact Messages",
    singular: "Contact Message",
    private: true,
    timestamps: false,
    orderBy: "submitted_at desc",
    listColumns: ["id", "name", "subject", "status", "priority", "submitted_at"],
    fields: [
      { name: "name", type: "text", readOnly: true },
      { name: "email", type: "text", readOnly: true },
      { name: "company", type: "text", readOnly: true },
      { name: "subject", type: "text", readOnly: true },
      { name: "message", type: "textarea", readOnly: true },
      { name: "submitted_at", label: "Submitted at", type: "text", readOnly: true },
      { name: "status", type: "select", options: LEAD_STATUS_OPTIONS, required: true },
      { name: "priority", type: "select", options: PRIORITY_OPTIONS },
      { name: "assigned_to", label: "Assigned to", type: "text" },
      { name: "internal_note", label: "Internal note", type: "textarea", hint: "Private notes for the team — never shown to the sender." },
    ],
  },

  project_inquiries: {
    table: "project_inquiries",
    label: "Project Inquiries (Quotes)",
    singular: "Project Inquiry",
    private: true,
    timestamps: false,
    orderBy: "submitted_at desc",
    listColumns: ["id", "name", "project_type", "budget", "status", "submitted_at"],
    fields: [
      { name: "project_type", label: "Project type", type: "text", readOnly: true },
      { name: "budget", type: "text", readOnly: true },
      { name: "timeline", type: "text", readOnly: true },
      { name: "description", label: "Project description", type: "textarea", readOnly: true },
      { name: "name", type: "text", readOnly: true },
      { name: "email", type: "text", readOnly: true },
      { name: "phone", label: "Mobile", type: "text", readOnly: true },
      { name: "submitted_at", label: "Submitted at", type: "text", readOnly: true },
      { name: "status", type: "select", options: LEAD_STATUS_OPTIONS, required: true },
      { name: "priority", type: "select", options: PRIORITY_OPTIONS },
      { name: "assigned_to", label: "Assigned to", type: "text" },
      { name: "internal_notes", label: "Internal notes", type: "textarea" },
    ],
  },

  job_applications: {
    table: "job_applications",
    label: "Job Applications",
    singular: "Job Application",
    private: true,
    timestamps: false,
    orderBy: "submitted_at desc",
    listColumns: ["id", "full_name", "job_title", "status", "submitted_at"],
    fields: [
      { name: "job_title", label: "Job title (snapshot)", type: "text", readOnly: true },
      { name: "job_id", label: "Job", type: "reference", refResource: "jobs", refLabel: "title", readOnly: true },
      { name: "full_name", label: "Full name", type: "text", readOnly: true },
      { name: "email", type: "text", readOnly: true },
      { name: "phone", type: "text", readOnly: true },
      { name: "linkedin", type: "text", readOnly: true },
      { name: "portfolio", label: "GitHub / Portfolio", type: "text", readOnly: true },
      { name: "cover_letter", label: "Cover letter", type: "textarea", readOnly: true },
      { name: "cv_filename", label: "CV file name", type: "text", readOnly: true },
      { name: "cv_url", label: "CV file", type: "cvfile", readOnly: true },
      { name: "consent", type: "boolean", readOnly: true },
      { name: "submitted_at", label: "Submitted at", type: "text", readOnly: true },
      { name: "status", type: "select", options: APPLICATION_STATUS_OPTIONS, required: true },
      { name: "admin_notes", label: "Admin notes", type: "textarea" },
      { name: "reviewed_by", label: "Reviewed by", type: "text" },
    ],
  },
};

module.exports = {
  resources,
  options: { STATUS_OPTIONS, GRID_SIZE_OPTIONS, LEAD_STATUS_OPTIONS, PRIORITY_OPTIONS, APPLICATION_STATUS_OPTIONS, ICON_OPTIONS },
};
