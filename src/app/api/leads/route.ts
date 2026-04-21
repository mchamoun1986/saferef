// /api/leads — POST (public) + GET (auth: admin/sales/management)
// Lead capture: tracks visitor progress through Calculator/Selector wizards.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// ── POST — create lead (public, no auth) ──────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const data: Record<string, unknown> = {
      source: typeof body.source === 'string' ? body.source : 'calculator',
      currentStep: typeof body.currentStep === 'number' ? body.currentStep : 1,
      status: typeof body.status === 'string' ? body.status : 'in_progress',
      firstName: typeof body.firstName === 'string' ? body.firstName : '',
      lastName: typeof body.lastName === 'string' ? body.lastName : '',
      company: typeof body.company === 'string' ? body.company : '',
      email: typeof body.email === 'string' ? body.email : '',
      phone: typeof body.phone === 'string' ? body.phone : '',
      country: typeof body.country === 'string' ? body.country : '',
      clientType: typeof body.clientType === 'string' ? body.clientType : '',
      application: typeof body.application === 'string' ? body.application : '',
      refrigerant: typeof body.refrigerant === 'string' ? body.refrigerant : '',
      preferredFamily: typeof body.preferredFamily === 'string' ? body.preferredFamily : '',
      voltage: typeof body.voltage === 'string' ? body.voltage : '',
      atex: typeof body.atex === 'boolean' ? body.atex : false,
      mountingType: typeof body.mountingType === 'string' ? body.mountingType : '',
      zonesJson: typeof body.zonesJson === 'string' ? body.zonesJson : JSON.stringify(body.zonesJson ?? []),
      totalDetectors: typeof body.totalDetectors === 'number' ? body.totalDetectors : 0,
      resultJson: typeof body.resultJson === 'string' ? body.resultJson : JSON.stringify(body.resultJson ?? {}),
    };

    const lead = await prisma.lead.create({ data });

    return NextResponse.json({ id: lead.id }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /leads error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

// ── GET — list leads (auth required) ──────────────────────────────────

export async function GET() {
  const authError = await requireRole(['admin', 'sales', 'management']);
  if (authError) return authError;

  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('[API] GET /leads error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
