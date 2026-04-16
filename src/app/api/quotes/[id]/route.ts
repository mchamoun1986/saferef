import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

function safeParse(value: string | null | undefined) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireRole(['admin', 'sales']);
  if (authError) return authError;

  const { id } = await params;

  const quote = await prisma.quote.findUnique({ where: { id } });
  if (!quote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...quote,
    bom: safeParse(quote.bomJson),
    zones: safeParse(quote.zonesJson),
    config: safeParse(quote.configJson),
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireRole(['admin', 'sales']);
  if (authError) return authError;

  const { id } = await params;

  const body = await request.json();

  const stringFields = [
    "status",
    "clientName",
    "clientEmail",
    "clientCompany",
    "clientPhone",
    "projectName",
    "projectRef",
    "customerGroup",
    "currency",
  ] as const;

  const numberFields = ["totalGross", "totalNet"] as const;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};

  for (const field of stringFields) {
    if (field in body) data[field] = body[field];
  }

  for (const field of numberFields) {
    if (field in body) data[field] = Number(body[field]);
  }

  if ("bomJson" in body) {
    data.bomJson =
      typeof body.bomJson === "string"
        ? body.bomJson
        : JSON.stringify(body.bomJson);
  }

  const quote = await prisma.quote.update({ where: { id }, data });

  return NextResponse.json({
    ...quote,
    bom: safeParse(quote.bomJson),
    zones: safeParse(quote.zonesJson),
    config: safeParse(quote.configJson),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireRole(['admin', 'sales']);
  if (authError) return authError;

  const { id } = await params;

  await prisma.quote.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
