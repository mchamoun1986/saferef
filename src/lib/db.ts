import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN?.replace(/\s+/g, "");

  // Turso remote: convert libsql:// to https:// for HTTP transport on Vercel
  if (tursoUrl && authToken) {
    const httpUrl = tursoUrl.replace("libsql://", "https://");
    const adapter = new PrismaLibSql({ url: httpUrl, authToken });
    return new PrismaClient({ adapter });
  }

  // Local dev: file-based SQLite
  const url = process.env.DATABASE_URL ?? "file:./saferef.db";
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
