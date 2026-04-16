import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./saferef.db";
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
