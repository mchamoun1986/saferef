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
  'GLACIAR Controller': 'glaciar-controller-10.png',
};

// Accessory images by code
const ACCESSORY_IMAGES: Record<string, string> = {
  // Alert — sirens & flashers
  '40-440': 'fl-rl-siren.png',
  '40-442': 'fl-rl-siren.png',
  '40-441': 'fl-rl-siren.png',
  '40-410': 'siren-1992.png',
  '40-4022': 'be-flashing-light.jpg',
  '40-4021': 'be-flashing-light.jpg',
  '40-4023': 'be-flashing-light.jpg',
  // UPS
  '40-221': 'ups-5000.png',
  '4000-0001': 'ups-1000.png',
  // Power adapter
  '4000-0002': 'power-adapter.jpg',
  // Protection brackets
  '40-901': 'protection-bracket.png',
  '40-902': 'protection-bracket.png',
  // Service tools
  '60-120': 'dt300.png',
  '60-130': 'dt300.png',
  // Flow regulators
  '61-9013': 'flow-regulator.jpg',
  '61-9015': 'flow-regulator.jpg',
  // Calibration adapter
  '62-9011': 'calibration-adapter.jpg',
  // Aquis
  '35-210': 'aquis500-water.png',
  // MIDI accessories
  '62-9022': 'midi-protection-cap.jpg',
  '62-9031': 'midi-pipe-adapter.jpg',
  '62-9041': 'midi-duct-adapter.jpg',
  '62-9051': 'midi-magnet-wands.jpg',
  // MIDI replacement sensor modules (SEN-series)
  'SEN-41032': 'midi-sensor-module.jpg',
  'SEN-42012': 'midi-sensor-module.jpg',
  'SEN-42017': 'midi-sensor-module.jpg',
  'SEN-45022': 'midi-sensor-module.jpg',
  'SEN-45023': 'midi-sensor-module.jpg',
  'SEN-45024': 'midi-sensor-module.jpg',
  'SEN-49013': 'midi-sensor-module.jpg',
  // Sensor protection caps
  'DEL659': 'sensor-protection-cap.png',
  'DEL660': 'sensor-protection-cap.png',
  // X5 components
  '3500-0029': 'x5-cable-gland.png',
  '3500-0030': 'x5-cable-gland.png',
  '3500-0031': 'x5-stopping-plug.png',
  // X5 accessories
  '3500-0085': 'x5-splash-guard.png',
  '3500-0086': 'protection-bracket.png',
  '3500-0087': 'x5-magnetic-wand.png',
  '3500-0088': 'x5-gas-collector.png',
  '3500-0089': 'sensor-protection-cap.png',
  '3500-0090': 'x5-splash-guard.png',
  '3500-0094': 'x5-calibration-kit.jpg',
  '3500-0104': 'midi-duct-adapter.jpg',
  '3500-0105': 'x5-pipe-adapter.jpg',
  '3500-0106': 'x5-calibration-kit.jpg',
  '3500-0110': 'x5-pipe-adapter.jpg',
  // Portables
  '5000-0001': 'glaciar-x5.png',
  '5000-0002': 'glaciar-x5.png',
  '5000-0003': 'glaciar-x5.png',
  '5000-0004': 'glaciar-x5.png',
  '5000-0005': 'glaciar-x5.png',
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
    // 5. Calibration gas bottles (61-series) get bottle photo
    else if (p.code.startsWith('61-')) {
      image = 'calibration-gas-bottle.png';
    }
    // 6. X5 accessories get X5 image
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
