import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { createClient } from "@libsql/client";

async function main() {
  // 1. Read schema from local DB
  const local = createClient({ url: `file:${path.resolve(__dirname, "../saferef.db")}` });
  const result = await local.execute("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL ORDER BY name");

  const statements = result.rows
    .map(r => String(r.sql))
    .filter(sql => !sql.includes("_prisma_migrations"));

  // Also get indexes
  const indexes = await local.execute("SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL");
  const indexStatements = indexes.rows.map(r => String(r.sql));

  console.log(`Found ${statements.length} tables and ${indexStatements.length} indexes`);

  // 2. Connect to Turso
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!tursoUrl || !authToken) {
    console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env");
    process.exit(1);
  }

  const remote = createClient({ url: tursoUrl, authToken });
  console.log(`Connected to Turso: ${tursoUrl}`);

  // 3. Push tables
  for (const sql of statements) {
    const tableName = sql.match(/CREATE TABLE "?(\w+)"?/)?.[1] ?? "unknown";
    try {
      await remote.execute(sql);
      console.log(`  ✓ ${tableName}`);
    } catch (e: any) {
      if (e.message?.includes("already exists")) {
        console.log(`  - ${tableName} (already exists)`);
      } else {
        console.error(`  ✗ ${tableName}: ${e.message}`);
      }
    }
  }

  // 4. Push indexes
  for (const sql of indexStatements) {
    try {
      await remote.execute(sql);
    } catch (e: any) {
      if (!e.message?.includes("already exists")) {
        console.error(`  Index error: ${e.message}`);
      }
    }
  }
  console.log("  ✓ indexes applied");

  console.log("\nSchema push complete!");
}

main().catch(console.error);
