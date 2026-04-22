# Lead Capture System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture client info and track progress through Calculator/Selector steps, so every visitor who starts a configuration becomes a lead in the admin panel — even if they abandon.

**Architecture:** New `Lead` Prisma model stores client data + step progress + configuration choices. Calculator and Selector pages auto-save leads via POST/PUT to `/api/leads` as the user advances through steps. Admin gets a new "Leads" page with table, filters, and progression badges.

**Tech Stack:** Prisma (SQLite/Turso), Next.js API routes, React client components, Tailwind CSS

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `prisma/schema.prisma` | Modify | Add `Lead` model |
| `src/app/api/leads/route.ts` | Create | POST (create) + GET (list with filters) |
| `src/app/api/leads/[id]/route.ts` | Create | GET (single) + PUT (update) + DELETE |
| `src/app/admin/leads/page.tsx` | Create | Admin leads list page with filters |
| `src/app/admin/nav.tsx` | Modify | Add "Leads" link for admin/sales/management |
| `src/app/calculator/page.tsx` | Modify | Auto-save lead on step transitions |
| `src/components/selector/SelectorWizard.tsx` | Modify | Auto-save lead on step transitions |
| `src/lib/lead-tracker.ts` | Create | Shared lead save/update helper (client-side) |
| `src/__tests__/lead-tracker.test.ts` | Create | Tests for lead tracker logic |

---

### Task 1: Add Lead Model to Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma` (append after LoginLog model, line ~197)

- [ ] **Step 1: Add Lead model to schema**

Add this model at the end of `prisma/schema.prisma` (before the closing):

```prisma
model Lead {
  id             String   @id @default(cuid())
  // Source
  source         String   @default("calculator")  // "calculator" | "selector"
  currentStep    Int      @default(1)
  status         String   @default("in_progress")  // "in_progress" | "completed" | "quoted" | "abandoned"
  // Client info (Step 1)
  firstName      String   @default("")
  lastName       String   @default("")
  company        String   @default("")
  email          String   @default("")
  phone          String   @default("")
  country        String   @default("")
  clientType     String   @default("")
  // Gas & Application (Step 2)
  application    String   @default("")
  refrigerant    String   @default("")
  preferredFamily String  @default("")
  // Technical (Step 3)
  voltage        String   @default("")
  atex           Boolean  @default(false)
  mountingType   String   @default("")
  // Zones (Step 4)
  zonesJson      String   @default("[]")           // JSON: [{name, detectorQty}]
  totalDetectors Int      @default(0)
  // Results
  resultJson     String   @default("{}")            // JSON: summary of solutions generated
  // Link to quote if saved
  quoteId        String?
  quoteRef       String?
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

- [ ] **Step 2: Push schema to local DB**

Run: `npx prisma db push`
Expected: Schema synced, no errors.

- [ ] **Step 3: Push schema to Turso**

Run: `npx tsx scripts/push-to-turso.ts`
Expected: Lead table created on Turso.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(lead): add Lead model to Prisma schema"
```

---

### Task 2: Create Lead API — POST + GET

**Files:**
- Create: `src/app/api/leads/route.ts`

- [ ] **Step 1: Create the API route with POST and GET handlers**

```typescript
// POST /api/leads — create a new lead (public, no auth needed)
// GET /api/leads — list leads (admin/sales/management only)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const lead = await prisma.lead.create({
      data: {
        source: body.source ?? 'calculator',
        currentStep: 1,
        firstName: body.firstName ?? '',
        lastName: body.lastName ?? '',
        company: body.company ?? '',
        email: body.email ?? '',
        phone: body.phone ?? '',
        country: body.country ?? '',
        clientType: body.clientType ?? '',
      },
    });

    return NextResponse.json({ id: lead.id }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /leads error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

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
```

- [ ] **Step 2: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/leads/route.ts
git commit -m "feat(lead): add POST/GET /api/leads endpoint"
```

---

### Task 3: Create Lead API — PUT + DELETE (single lead)

**Files:**
- Create: `src/app/api/leads/[id]/route.ts`

- [ ] **Step 1: Create the dynamic route**

```typescript
// GET/PUT/DELETE /api/leads/[id]

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// PUT — update lead (public for step tracking, fields restricted)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = [
      'currentStep', 'status',
      'application', 'refrigerant', 'preferredFamily',
      'voltage', 'atex', 'mountingType',
      'zonesJson', 'totalDetectors',
      'resultJson', 'quoteId', 'quoteRef',
    ] as const;

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) data[field] = body[field];
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const lead = await prisma.lead.update({ where: { id }, data });
    return NextResponse.json({ id: lead.id, currentStep: lead.currentStep });
  } catch (error) {
    console.error('[API] PUT /leads/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

// GET — single lead (admin only)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireRole(['admin', 'sales', 'management']);
  if (authError) return authError;

  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json(lead);
}

// DELETE — admin only
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireRole(['admin']);
  if (authError) return authError;

  const { id } = await params;
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/leads/[id]/route.ts
git commit -m "feat(lead): add PUT/GET/DELETE /api/leads/[id] endpoint"
```

---

### Task 4: Create Client-Side Lead Tracker Helper

**Files:**
- Create: `src/lib/lead-tracker.ts`

- [ ] **Step 1: Create the lead tracker module**

```typescript
// lead-tracker.ts — Client-side helper to create/update leads during wizard flows

const LEAD_STORAGE_KEY = 'saferef-lead-id';

/** Get the current lead ID from sessionStorage */
export function getLeadId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(LEAD_STORAGE_KEY);
}

/** Store lead ID in sessionStorage */
function setLeadId(id: string) {
  sessionStorage.setItem(LEAD_STORAGE_KEY, id);
}

/** Clear lead ID (on completion or new session) */
export function clearLeadId() {
  sessionStorage.removeItem(LEAD_STORAGE_KEY);
}

/** Create a new lead (Step 1 → Step 2 transition) */
export async function createLead(data: {
  source: 'calculator' | 'selector';
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  clientType?: string;
}): Promise<string | null> {
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const { id } = await res.json();
    setLeadId(id);
    return id;
  } catch {
    return null;
  }
}

/** Update an existing lead (step transitions) */
export async function updateLead(data: Record<string, unknown>): Promise<boolean> {
  const id = getLeadId();
  if (!id) return false;
  try {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/lead-tracker.ts
git commit -m "feat(lead): add client-side lead tracker helper"
```

---

### Task 5: Integrate Lead Tracking into Calculator Page

**Files:**
- Modify: `src/app/calculator/page.tsx`

- [ ] **Step 1: Add imports at top of file**

Add after existing imports:

```typescript
import { createLead, updateLead, clearLeadId } from '@/lib/lead-tracker';
```

- [ ] **Step 2: Track lead on step transitions**

Find the `nextStep` function in the calculator page. It handles validation and advances the step. After the step is advanced successfully, add lead tracking calls.

In the `nextStep()` function, after `setStep(step + 1)` (or equivalent), add lead tracking:

```typescript
// After step 1 → 2: Create lead
if (step === 1) {
  createLead({
    source: 'calculator',
    firstName: clientData.firstName,
    lastName: clientData.lastName,
    company: clientData.company,
    email: clientData.email,
    phone: clientData.phone,
    country: clientData.country,
    clientType: clientData.clientType,
  });
}

// After step 2 → 3: Update with gas/app
if (step === 2) {
  updateLead({
    currentStep: 3,
    application: gasAppData.application,
    refrigerant: gasAppData.refrigerant,
  });
}

// After step 3 → 4: Update with zones
if (step === 3) {
  updateLead({
    currentStep: 4,
    zonesJson: JSON.stringify(zones),
    totalDetectors: zones.reduce((s: number, z: { detectorQty: number }) => s + z.detectorQty, 0),
  });
}
```

NOTE: The exact location depends on the current `nextStep` function structure. Read the file to find where `setStep` is called and add the tracking AFTER the step change, fire-and-forget (no await needed).

- [ ] **Step 3: Track step 4 → 5 and 5 → 6 transitions**

Find where `setStep(5)` and `setStep(6)` are called and add:

```typescript
// Before setStep(5): update lead to step 5 with technical data
updateLead({
  currentStep: 5,
  voltage: gasAppData.voltage,
  atex: gasAppData.atex,
  mountingType: gasAppData.mountingType || '',
});

// Before setStep(6): update lead to completed
updateLead({
  currentStep: 6,
  status: 'completed',
});
```

- [ ] **Step 4: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/calculator/page.tsx
git commit -m "feat(lead): integrate lead tracking into calculator wizard"
```

---

### Task 6: Integrate Lead Tracking into Selector Wizard

**Files:**
- Modify: `src/components/selector/SelectorWizard.tsx`

- [ ] **Step 1: Add imports**

Add after existing imports:

```typescript
import { createLead, updateLead } from '@/lib/lead-tracker';
```

- [ ] **Step 2: Add lead tracking to step transitions**

Find where steps are advanced in the SelectorWizard. The selector has 5 steps: Client, Application & Gas, Technical, Zones, Products.

After the user passes step 1 (client info validated, moving to step 2):

```typescript
// Step 1 → 2: Create lead
createLead({
  source: 'selector',
  firstName: clientData.firstName,
  lastName: clientData.lastName,
  company: clientData.company,
  email: clientData.email,
  phone: clientData.phone,
  country: clientData.country,
});
```

After step 2 → 3:
```typescript
updateLead({ currentStep: 3, application, refrigerant, preferredFamily });
```

After step 3 → 4:
```typescript
updateLead({ currentStep: 4, voltage, atex: atexRequired, mountingType: mountType });
```

After step 4 → 5 (results):
```typescript
updateLead({
  currentStep: 5,
  status: 'completed',
  zonesJson: JSON.stringify(zones),
  totalDetectors: zones.reduce((s, z) => s + z.detectorQty, 0),
});
```

- [ ] **Step 3: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/selector/SelectorWizard.tsx
git commit -m "feat(lead): integrate lead tracking into selector wizard"
```

---

### Task 7: Create Admin Leads Page

**Files:**
- Create: `src/app/admin/leads/page.tsx`
- Modify: `src/app/admin/nav.tsx`

- [ ] **Step 1: Add "Leads" to admin navigation**

In `src/app/admin/nav.tsx`, in the `ALL_LINKS` array, add this entry after the Dashboard link (line 17):

```typescript
{ href: '/admin/leads', label: 'Leads', roles: ['admin', 'sales', 'management'] },
```

- [ ] **Step 2: Create the Leads admin page**

Create `src/app/admin/leads/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Users, Filter, Trash2, Eye, RefreshCw } from 'lucide-react';

interface Lead {
  id: string;
  source: string;
  currentStep: number;
  status: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  application: string;
  refrigerant: string;
  totalDetectors: number;
  quoteRef: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  quoted: 'bg-blue-100 text-blue-700',
  abandoned: 'bg-gray-100 text-gray-500',
};

const STEP_LABELS_CALC = ['', 'Client', 'Gas & App', 'Zones', 'Calc Sheet', 'Technical', 'Products'];
const STEP_LABELS_SEL = ['', 'Client', 'App & Gas', 'Technical', 'Zones', 'Products'];

function stepLabel(source: string, step: number): string {
  const labels = source === 'selector' ? STEP_LABELS_SEL : STEP_LABELS_CALC;
  return labels[step] ?? `Step ${step}`;
}

function stepProgress(source: string, step: number): number {
  const max = source === 'selector' ? 5 : 6;
  return Math.round((step / max) * 100);
}

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return d; }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSource, setFilterSource] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = () => {
    setLoading(true);
    fetch('/api/leads')
      .then(r => r.json())
      .then(data => { setLeads(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchLeads(); }, []);

  const deleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    setLeads(prev => prev.filter(l => l.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);
  };

  const filtered = leads.filter(l => {
    if (filterSource && l.source !== filterSource) return false;
    if (filterStatus && l.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: leads.length,
    inProgress: leads.filter(l => l.status === 'in_progress').length,
    completed: leads.filter(l => l.status === 'completed').length,
    quoted: leads.filter(l => l.status === 'quoted').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-[#16354B]" />
          <h1 className="text-2xl font-bold text-[#16354B]">Leads</h1>
          <span className="text-sm text-gray-500">({filtered.length})</span>
        </div>
        <button onClick={fetchLeads} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#16354B] transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-[#16354B]' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-yellow-500' },
          { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
          { label: 'Quoted', value: stats.quoted, color: 'bg-blue-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-xs text-gray-500 font-medium">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-[#16354B] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
          <option value="">All Sources</option>
          <option value="calculator">Calculator</option>
          <option value="selector">Selector</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
          <option value="">All Status</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="quoted">Quoted</option>
        </select>
        {(filterSource || filterStatus) && (
          <button onClick={() => { setFilterSource(''); setFilterStatus(''); }} className="text-xs text-red-600 hover:underline">Clear</button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No leads yet. Leads are captured when visitors use the Calculator or Selector.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Company</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Progress</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Config</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-[#16354B]">{lead.firstName} {lead.lastName}</div>
                    <div className="text-xs text-gray-400">{lead.email}</div>
                  </td>
                  <td className="py-3 px-3 text-gray-600">{lead.company || '—'}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${lead.source === 'calculator' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {lead.source}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-[#A7C031] h-1.5 rounded-full" style={{ width: `${stepProgress(lead.source, lead.currentStep)}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{stepLabel(lead.source, lead.currentStep)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_BADGE[lead.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-500">
                    {lead.application && <div>{lead.application}</div>}
                    {lead.refrigerant && <div>{lead.refrigerant}</div>}
                    {lead.totalDetectors > 0 && <div>{lead.totalDetectors} det.</div>}
                    {lead.quoteRef && <div className="text-blue-600">{lead.quoteRef}</div>}
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-400">{fmtDate(lead.createdAt)}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedLead(lead)} className="p-1 text-gray-400 hover:text-[#16354B]" title="View details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteLead(lead.id)} className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelectedLead(null)}>
          <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#16354B]">Lead Details</h2>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="space-y-4 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedLead.firstName} {selectedLead.lastName}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedLead.email}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedLead.phone || '—'}</span></div>
              <div><span className="text-gray-500">Company:</span> <span className="font-medium">{selectedLead.company || '—'}</span></div>
              <div><span className="text-gray-500">Country:</span> <span className="font-medium">{selectedLead.country || '—'}</span></div>
              <hr />
              <div><span className="text-gray-500">Source:</span> <span className="font-medium">{selectedLead.source}</span></div>
              <div><span className="text-gray-500">Current Step:</span> <span className="font-medium">{stepLabel(selectedLead.source, selectedLead.currentStep)} ({selectedLead.currentStep})</span></div>
              <div><span className="text-gray-500">Status:</span> <span className="font-medium">{selectedLead.status}</span></div>
              <hr />
              <div><span className="text-gray-500">Application:</span> <span className="font-medium">{selectedLead.application || '—'}</span></div>
              <div><span className="text-gray-500">Refrigerant:</span> <span className="font-medium">{selectedLead.refrigerant || '—'}</span></div>
              <div><span className="text-gray-500">Total Detectors:</span> <span className="font-medium">{selectedLead.totalDetectors || '—'}</span></div>
              <div><span className="text-gray-500">Quote:</span> <span className="font-medium">{selectedLead.quoteRef || 'None'}</span></div>
              <hr />
              <div><span className="text-gray-500">Created:</span> <span className="font-medium">{fmtDate(selectedLead.createdAt)}</span></div>
              <div><span className="text-gray-500">Last Updated:</span> <span className="font-medium">{fmtDate(selectedLead.updatedAt)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/leads/page.tsx src/app/admin/nav.tsx
git commit -m "feat(lead): add admin Leads page with table, filters, detail panel"
```

---

### Task 8: End-to-End Verification

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: All existing tests pass (209+).

- [ ] **Step 2: Build for production**

Run: `npx next build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Push to GitHub (triggers Vercel deploy)**

```bash
git push origin master
```

- [ ] **Step 4: Push schema to Turso production**

Run: `npx tsx scripts/push-to-turso.ts`
Expected: Lead table created on Turso.

- [ ] **Step 5: Verify on production**

Test the following on `saferef.vercel.app`:
1. Go to /selector, fill step 1, click Next → lead should be created
2. Continue to step 2, select app + gas, click Next → lead should update
3. Go to /admin/leads (login as admin) → lead should appear in table
4. Click eye icon → detail panel should show all captured data

---

## Execution Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Prisma Lead model | schema.prisma |
| 2 | POST/GET /api/leads | api/leads/route.ts |
| 3 | PUT/GET/DELETE /api/leads/[id] | api/leads/[id]/route.ts |
| 4 | Client-side lead tracker | lib/lead-tracker.ts |
| 5 | Calculator integration | calculator/page.tsx |
| 6 | Selector integration | SelectorWizard.tsx |
| 7 | Admin Leads page + nav | admin/leads/page.tsx, nav.tsx |
| 8 | E2E verification | — |
