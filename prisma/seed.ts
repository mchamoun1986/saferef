import * as path from "path";
import * as dotenv from "dotenv";

// Load .env from the project root (one level up from prisma/)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as bcryptjs from "bcryptjs";

import { REFRIGERANTS_V5 } from "./seed-data/refrigerants-v5";
import { GAS_CATEGORIES } from "./seed-data/gas-categories";
import { APPLICATIONS } from "./seed-data/applications";
import { SPACE_TYPES } from "./seed-data/space-types";
import { PRODUCTS, DISCONTINUED_CODES } from './seed-data/products';
import { DISCOUNT_MATRIX } from './seed-data/discount-matrix';
import { PRODUCT_RELATIONS } from './seed-data/product-relations';

function createPrismaClient() {
  // DATABASE_URL from .env: "file:./saferef.db"
  // Resolve relative to project root
  const rawUrl = process.env.DATABASE_URL ?? "file:./saferef.db";
  let resolvedUrl: string;
  if (rawUrl.startsWith("file:")) {
    const filePath = rawUrl.slice("file:".length);
    const absPath = path.resolve(__dirname, "../", filePath);
    resolvedUrl = `file:${absPath}`;
  } else {
    resolvedUrl = rawUrl;
  }
  const adapter = new PrismaLibSql({ url: resolvedUrl });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  // ── Clear all tables ──
  console.log("Clearing existing data...");
  await prisma.productRelation.deleteMany();
  await prisma.discountMatrix.deleteMany();
  await prisma.product.deleteMany();
  await prisma.calcSheet.deleteMany();
  await prisma.application.deleteMany();
  await prisma.spaceType.deleteMany();
  await prisma.gasCategory.deleteMany();
  await prisma.refrigerantV5.deleteMany();
  await prisma.adminUser.deleteMany();

  // ── RefrigerantV5 ──
  console.log(`Inserting ${REFRIGERANTS_V5.length} refrigerants (V5)...`);
  for (const r of REFRIGERANTS_V5) {
    await prisma.refrigerantV5.create({ data: r });
  }
  console.log(`  ✓ ${REFRIGERANTS_V5.length} refrigerants inserted`);

  // ── Gas Categories ──
  console.log(`Inserting ${GAS_CATEGORIES.length} gas categories...`);
  for (const gc of GAS_CATEGORIES) {
    await prisma.gasCategory.create({ data: gc });
  }
  console.log(`  ✓ ${GAS_CATEGORIES.length} gas categories inserted`);

  // ── Applications ──
  console.log(`Inserting ${APPLICATIONS.length} applications...`);
  for (const app of APPLICATIONS) {
    await prisma.application.create({ data: app });
  }
  console.log(`  ✓ ${APPLICATIONS.length} applications inserted`);

  // ── Space Types ──
  console.log(`Inserting ${SPACE_TYPES.length} space types...`);
  for (const st of SPACE_TYPES) {
    await prisma.spaceType.upsert({ where: { id: st.id }, update: st, create: st });
  }
  console.log(`  ✓ ${SPACE_TYPES.length} space types inserted`);

  // ── Default Admin ──
  console.log("Creating default admin user...");
  const hash = await bcryptjs.hash("admin2026", 10);
  await prisma.adminUser.create({
    data: {
      email: "admin@saferef.com",
      password: hash,
      name: "Admin",
      role: "admin",
    },
  });
  console.log("  ✓ Admin user created: admin@saferef.com");

  // Seed Products
  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { code: p.code },
      update: { ...p },
      create: { ...p },
    });
  }
  console.log('  Products:    ', PRODUCTS.length);

  // Mark out-of-scope products as discontinued
  for (const code of DISCONTINUED_CODES) {
    await prisma.product.updateMany({
      where: { code },
      data: { discontinued: true },
    });
  }
  console.log(`Marked ${DISCONTINUED_CODES.length} products as discontinued`);

  // Seed Discount Matrix
  await prisma.discountMatrix.deleteMany();
  for (const d of DISCOUNT_MATRIX) {
    await prisma.discountMatrix.create({ data: d });
  }
  console.log('  Discounts:   ', DISCOUNT_MATRIX.length);

  // Seed Product Relations
  await prisma.productRelation.deleteMany();
  for (const r of PRODUCT_RELATIONS) {
    await prisma.productRelation.create({ data: r });
  }
  console.log('  Relations:   ', PRODUCT_RELATIONS.length);

  console.log("\nSeed complete!");
  console.log(`  Refrigerants:   ${REFRIGERANTS_V5.length}`);
  console.log(`  Gas Categories: ${GAS_CATEGORIES.length}`);
  console.log(`  Applications:   ${APPLICATIONS.length}`);
  console.log(`  Space Types:    ${SPACE_TYPES.length}`);
  console.log(`  Products:       ${PRODUCTS.length}`);
  console.log(`  Discounts:      ${DISCOUNT_MATRIX.length}`);
  console.log(`  Relations:      ${PRODUCT_RELATIONS.length}`);
  console.log(`  Admin user:     admin@samon.com`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
