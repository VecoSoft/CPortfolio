const app = require("./src/app");
const env = require("./src/config/env");
const { query } = require("./src/config/db");

// Additive, idempotent column add so a deploy never runs ahead of the DB
// (the insert in submitInquiry needs it). Nullable — existing rows untouched.
// Mirrors the ALTER in schema.sql.
async function ensureSchema() {
  try {
    await query("ALTER TABLE project_inquiries ADD COLUMN IF NOT EXISTS phone TEXT");
  } catch (err) {
    console.error("Startup schema check failed (run `npm run migrate`):", err.message);
  }
}

ensureSchema().then(() => {
  app.listen(env.port, () => {
    console.log(`Vicosoft backend listening on http://localhost:${env.port}`);
    console.log(`  Public API : http://localhost:${env.port}/api`);
    console.log(`  Admin panel: http://localhost:${env.port}/admin`);
  });
});
