-- ============================================================================
-- Vicosoft portfolio site — PostgreSQL schema
-- Replaces the Sanity.io dataset (see sanity/schemaTypes/* in the old project).
--
-- Design notes
-- ------------
-- * Sanity's flexible nested "objects" (mediaRef, projectImages, featureItem,
--   processStep, howItWorksStep, workStep, techGroup, socialLinks, seo) are
--   stored as JSONB columns here instead of extra join tables. They are
--   edited as structured JSON from the admin panel, exactly the way they
--   were structured in Sanity's GROQ query results — so the frontend's
--   existing TypeScript shapes (src/sanity/types.ts) barely change.
-- * True relations (Product -> ProductCategory, Solution -> Service[],
--   JobApplication -> Job) are real foreign keys.
-- * `slug` columns are plain unique text (Sanity's `slug.current`).
-- * Every content table has `created_at` / `updated_at`, auto-maintained by
--   the `set_updated_at` trigger below (mirrors Sanity's _createdAt/_updatedAt).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Admin users (replaces Sanity Studio / sanity.io project members)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id                   SERIAL PRIMARY KEY,
  name                 TEXT NOT NULL,
  email                TEXT NOT NULL UNIQUE,
  password_hash        TEXT NOT NULL,
  role                 TEXT NOT NULL DEFAULT 'admin', -- 'admin' | 'editor'
  reset_token_hash     TEXT,
  reset_token_expires  TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- CREATE TABLE IF NOT EXISTS is a no-op on an already-existing table, so
-- columns added after the table's first deploy need an explicit ALTER here.
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS reset_token_hash TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;
DROP TRIGGER IF EXISTS trg_admin_users_updated ON admin_users;
CREATE TRIGGER trg_admin_users_updated BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Site settings — singleton (mirrors siteSettings.ts). Always row id = 1.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id                SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name      TEXT NOT NULL DEFAULT 'VecoSoft',
  tagline           TEXT NOT NULL DEFAULT '',
  email             TEXT NOT NULL DEFAULT '',
  location          TEXT NOT NULL DEFAULT '',
  social_links      JSONB NOT NULL DEFAULT '{}'::jsonb, -- {linkedin, github, facebook, x}
  capabilities      JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  commitments       JSONB NOT NULL DEFAULT '[]'::jsonb, -- featureItem[] {title, description}
  why_vicosoft      JSONB NOT NULL DEFAULT '[]'::jsonb, -- featureItem[]
  tech_stack_groups JSONB NOT NULL DEFAULT '[]'::jsonb, -- techGroup[] {group, items[]}
  how_we_work       JSONB NOT NULL DEFAULT '[]'::jsonb, -- workStep[] {title, description, checkpoint}
  seo               JSONB NOT NULL DEFAULT '{}'::jsonb, -- {title, description, ogImageUrl}
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_site_settings_updated ON site_settings;
CREATE TRIGGER trg_site_settings_updated BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Services (services.ts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id                 SERIAL PRIMARY KEY,
  name               TEXT NOT NULL,
  slug               TEXT NOT NULL UNIQUE,
  short_description  TEXT NOT NULL,
  icon               TEXT NOT NULL, -- Code2 | BrainCircuit | Smartphone | PenTool | Cloud | Settings2
  problems           JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  features           JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  technologies       JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  process            JSONB NOT NULL DEFAULT '[]'::jsonb, -- processStep[] {title, description}
  deliverables       JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  display_order      INTEGER,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_services_updated ON services;
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Solutions (solution.ts) — references services
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS solutions (
  id                 SERIAL PRIMARY KEY,
  name               TEXT NOT NULL,
  slug               TEXT NOT NULL UNIQUE,
  short_description  TEXT NOT NULL,
  outcomes           JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  related_service_ids INTEGER[] NOT NULL DEFAULT '{}',
  display_order      INTEGER,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_solutions_updated ON solutions;
CREATE TRIGGER trg_solutions_updated BEFORE UPDATE ON solutions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Product categories (productCategory.ts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_categories (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  display_order INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_product_categories_updated ON product_categories;
CREATE TRIGGER trg_product_categories_updated BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Products (product.ts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  category_id   INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
  tagline       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'concept', -- live|in-development|prototype|concept|research
  description   TEXT NOT NULL,
  problem       TEXT NOT NULL,
  idea          TEXT NOT NULL,
  how_it_works  JSONB NOT NULL DEFAULT '[]'::jsonb, -- howItWorksStep[] {step, description}
  features      JSONB NOT NULL DEFAULT '[]'::jsonb, -- featureItem[] {title, description}
  technologies  JSONB NOT NULL DEFAULT '[]'::jsonb, -- techGroup[] {group, items[]}
  use_cases     JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  roadmap       JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  images        JSONB NOT NULL DEFAULT '{}'::jsonb, -- projectImages {thumbnail, heroImage, gallery[]}
  size          TEXT NOT NULL DEFAULT 'standard',   -- standard|wide|tall|large
  featured      BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_products_updated ON products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Case studies / Work (caseStudy.ts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_studies (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  client           TEXT NOT NULL,
  industry         TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'live',
  summary          TEXT NOT NULL,
  challenge        TEXT NOT NULL,
  approach         JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  solution         TEXT NOT NULL,
  architecture     TEXT NOT NULL,
  result           TEXT NOT NULL,
  technologies     JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  images           JSONB NOT NULL DEFAULT '{}'::jsonb, -- projectImages
  size             TEXT NOT NULL DEFAULT 'standard',
  featured         BOOLEAN NOT NULL DEFAULT false,
  published_at     DATE,
  client_approved  BOOLEAN NOT NULL DEFAULT false, -- distinct gate, see original schema comment
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_case_studies_updated ON case_studies;
CREATE TRIGGER trg_case_studies_updated BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Experiments / Labs (experiment.ts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experiments (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  category      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'research',
  summary       TEXT NOT NULL,
  description   TEXT NOT NULL,
  technologies  JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  images        JSONB NOT NULL DEFAULT '{}'::jsonb, -- projectImages
  size          TEXT NOT NULL DEFAULT 'standard',
  display_order INTEGER,
  featured      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_experiments_updated ON experiments;
CREATE TRIGGER trg_experiments_updated BEFORE UPDATE ON experiments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Jobs (job.ts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
  id                SERIAL PRIMARY KEY,
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  location          TEXT NOT NULL,
  type              TEXT NOT NULL, -- Full-time|Part-time|Contract|Internship
  experience        TEXT NOT NULL,
  duration          TEXT, -- e.g. "2 months" — mainly relevant for internships
  stipend           TEXT, -- e.g. "Unpaid", "৳15,000/month" — mainly relevant for internships
  tags              JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  about             TEXT NOT NULL,
  responsibilities  JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  requirements      JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  nice_to_have      JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  benefits          JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  status            TEXT NOT NULL DEFAULT 'open', -- open|closed
  deadline          DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- CREATE TABLE IF NOT EXISTS is a no-op once the table already exists (this
-- project's migrate.js just re-runs this whole file on every deploy), so a
-- column added after initial launch needs an explicit ALTER TABLE too.
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS stipend TEXT;
DROP TRIGGER IF EXISTS trg_jobs_updated ON jobs;
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- FAQs (faq.ts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faqs (
  id            SERIAL PRIMARY KEY,
  question      TEXT NOT NULL,
  answer        TEXT NOT NULL,
  display_order INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_faqs_updated ON faqs;
CREATE TRIGGER trg_faqs_updated BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Team members (teamMember.ts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_members (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL,
  photo_url     TEXT, -- served from /uploads via the admin's image upload
  quote         TEXT NOT NULL,
  linkedin      TEXT,
  display_order INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_team_members_updated ON team_members;
CREATE TRIGGER trg_team_members_updated BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ===========================================================================
-- PRIVATE / operational tables (contactMessage.ts, projectInquiry.ts,
-- jobApplication.ts). Never exposed on any public GET route — only written
-- to by the public POST endpoints and read/managed from the admin panel.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  company       TEXT,
  subject       TEXT NOT NULL,
  message       TEXT NOT NULL,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status        TEXT NOT NULL DEFAULT 'new', -- new|in-progress|replied|closed|archived
  priority      TEXT NOT NULL DEFAULT 'medium', -- low|medium|high
  assigned_to   TEXT,
  internal_note TEXT
);

CREATE TABLE IF NOT EXISTS project_inquiries (
  id             SERIAL PRIMARY KEY,
  project_type   TEXT NOT NULL, -- Web|Mobile|AI/ML|Software|UI/UX|Other
  budget         TEXT NOT NULL,
  timeline       TEXT NOT NULL,
  description    TEXT NOT NULL,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  status         TEXT NOT NULL DEFAULT 'new',
  priority       TEXT NOT NULL DEFAULT 'medium',
  assigned_to    TEXT,
  internal_notes TEXT
);
-- Added after launch; nullable so existing inquiries are kept as-is.
ALTER TABLE project_inquiries ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE TABLE IF NOT EXISTS job_applications (
  id            SERIAL PRIMARY KEY,
  job_title     TEXT NOT NULL, -- snapshot, always populated (see job.ts comment)
  job_id        INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL,
  linkedin      TEXT,
  portfolio     TEXT,
  cover_letter  TEXT NOT NULL,
  cv_filename   TEXT,       -- original file name, e.g. "jane-doe-cv.pdf"
  cv_url        TEXT,       -- path under /uploads to the stored CV (replaces base64-in-document)
  consent       BOOLEAN NOT NULL DEFAULT false,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status        TEXT NOT NULL DEFAULT 'new', -- new|reviewing|shortlisted|interview|rejected|hired|archived
  admin_notes   TEXT,
  reviewed_by   TEXT,
  reviewed_at   TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_case_studies_approved ON case_studies(client_approved) WHERE client_approved = true;
CREATE INDEX IF NOT EXISTS idx_experiments_featured ON experiments(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_project_inquiries_status ON project_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
