/**
 * Assign product images after seeding.
 * Maps product codes/families to image paths in /assets/.
 */
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrismaClient() {
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

// Image mapping: code → image path, or family-based fallback
const CODE_IMAGES: Record<string, string> = {
  // X5 controller
  '3500-0001': 'glaciar-x5.png',
};

// Family-based image mapping (applied to all products in family without a code-specific image)
const FAMILY_IMAGES: Record<string, { integrated: string; remote: string }> = {
  'MIDI': { integrated: 'glaciar-midi.png', remote: 'glaciar-midi-remote.jpg' },
  'X5': { integrated: 'x5-sensor-module.png', remote: 'x5-remote-sensor.png' },
  'RM': { integrated: 'rm-product.png', remote: 'rm-product.png' },
};

// Controller images by code prefix
const CONTROLLER_IMAGES: Record<string, string> = {
  'MPU': 'mpu.png',
  'SPU': 'spu.png',
  'SPLS': 'spls.png',
  'LAN': 'lan.png',
  'UNIT': 'glaciar-controller-10.jpg',
  'SCU': 'glaciar-controller-10.jpg',
};

// Accessory images by subCategory or code prefix
const ACCESSORY_IMAGES: Record<string, string> = {
  // Alert
  '40-440': 'alarm-flash-siren.png',
  '40-442': 'alarm-flash-siren.png',
  '40-441': 'alarm-flash-siren.png',
  '40-410': 'alarm-siren.png',
  '40-4022': 'alarm-beacon.png',
  '40-4021': 'alarm-beacon.png',
  '40-4023': 'alarm-beacon.png',
  '40-221': 'alarm-beacon.png',
  // Power
  '4000-0001': 'glaciar-power.jpg',
  '4000-0002': 'power-adapter.jpg',
  // Service/DT300
  '60-120': 'dt300.png',
  '60-130': 'dt300.png',
  // Calibration adapter
  '62-9011': 'calibration-adapter.jpg',
  // Aquis
  '35-210': 'aquis.png',
};

async function main() {
  const products = await prisma.product.findMany();
  let updated = 0;

  for (const p of products) {
    let image: string | null = null;

    // 1. Code-specific image
    if (CODE_IMAGES[p.code]) {
      image = CODE_IMAGES[p.code];
    }
    // 2. Accessory-specific image
    else if (ACCESSORY_IMAGES[p.code]) {
      image = ACCESSORY_IMAGES[p.code];
    }
    // 3. Family-based detector image
    else if (p.type === 'detector' && FAMILY_IMAGES[p.family]) {
      const fam = FAMILY_IMAGES[p.family];
      image = p.remote ? fam.remote : fam.integrated;
    }
    // 4. Controller image by name prefix
    else if (p.type === 'controller') {
      for (const [prefix, img] of Object.entries(CONTROLLER_IMAGES)) {
        if (p.name.startsWith(prefix)) {
          image = img;
          break;
        }
      }
    }
    // 5. X5 accessories get X5 image
    else if (p.type === 'accessory' && p.compatibleFamilies?.includes('X5')) {
      image = 'glaciar-x5.png';
    }
    // 6. MIDI accessories get MIDI image
    else if (p.type === 'accessory' && p.compatibleFamilies?.includes('MIDI')) {
      image = 'glaciar-midi.png';
    }

    if (image && image !== p.image) {
      await prisma.product.update({ where: { id: p.id }, data: { image } });
      updated++;
    }
  }

  console.log(`Updated ${updated}/${products.length} product images`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
