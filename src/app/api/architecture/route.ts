import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [
      productCount,
      detectorCount,
      controllerCount,
      accessoryCount,
      refrigerantCount,
      applicationCount,
      spaceTypeCount,
      gasCategoryCount,
      discountCount,
      quoteCount,
      calcSheetCount,
      quoteDraft,
      quoteSent,
      quoteAccepted,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { type: "detector" } }),
      prisma.product.count({ where: { type: "controller" } }),
      prisma.product.count({ where: { type: "accessory" } }),
      prisma.refrigerantV5.count(),
      prisma.application.count(),
      prisma.spaceType.count(),
      prisma.gasCategory.count(),
      prisma.discountMatrix.count(),
      prisma.quote.count(),
      prisma.calcSheet.count(),
      prisma.quote.count({ where: { status: "draft" } }),
      prisma.quote.count({ where: { status: "sent" } }),
      prisma.quote.count({ where: { status: "accepted" } }),
    ]);

    return NextResponse.json({
      db: {
        products: { total: productCount, detectors: detectorCount, controllers: controllerCount, accessories: accessoryCount },
        refrigerants: refrigerantCount,
        applications: applicationCount,
        spaceTypes: spaceTypeCount,
        gasCategories: gasCategoryCount,
        discountRules: discountCount,
        quotes: { total: quoteCount, draft: quoteDraft, sent: quoteSent, accepted: quoteAccepted },
        calcSheets: calcSheetCount,
      },
      pages: {
        public: 5,
        admin: 12,
        total: 17,
      },
      api: {
        public: 8,
        auth: 6,
        total: 14,
      },
      engines: {
        m1: { rules: ["EN 378", "ASHRAE 15", "ISO 5149"], files: 6 },
        m2: { filters: 10, files: 7 },
      },
      models: 9,
      regulations: 3,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
