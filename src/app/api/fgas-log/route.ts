import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// POST — public: log anonymous F-Gas calculation
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const data = {
      refrigerantId: typeof body.refrigerantId === 'string' ? body.refrigerantId : '',
      chargeKg: typeof body.chargeKg === 'number' ? body.chargeKg : 0,
      co2eq: typeof body.co2eq === 'number' ? body.co2eq : 0,
      band: typeof body.band === 'string' ? body.band : 'none',
      mandatory: typeof body.mandatory === 'boolean' ? body.mandatory : false,
      isHfo: typeof body.isHfo === 'boolean' ? body.isHfo : false,
      isHermetic: typeof body.isHermetic === 'boolean' ? body.isHermetic : false,
    };

    await prisma.fGasLog.create({ data });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /fgas-log error:', error);
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
}

// GET — admin: return aggregated stats
export async function GET() {
  const authError = await requireRole(['admin', 'management']);
  if (authError) return authError;

  try {
    const total = await prisma.fGasLog.count();

    const logs = await prisma.fGasLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const allLogs = await prisma.fGasLog.findMany({ select: { refrigerantId: true, band: true, mandatory: true } });

    const byRefrigerant = new Map<string, number>();
    const byBand = new Map<string, number>();
    let mandatoryCount = 0;

    for (const log of allLogs) {
      byRefrigerant.set(log.refrigerantId, (byRefrigerant.get(log.refrigerantId) ?? 0) + 1);
      byBand.set(log.band, (byBand.get(log.band) ?? 0) + 1);
      if (log.mandatory) mandatoryCount++;
    }

    const topRefrigerants = [...byRefrigerant.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({ id, count }));

    return NextResponse.json({
      total,
      topRefrigerants,
      byBand: Object.fromEntries(byBand),
      mandatoryPercent: total > 0 ? Math.round(mandatoryCount / total * 100) : 0,
      recent: logs,
    });
  } catch (error) {
    console.error('[API] GET /fgas-log error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
