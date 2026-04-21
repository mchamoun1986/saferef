const LEAD_STORAGE_KEY = 'saferef-lead-id';

export function getLeadId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(LEAD_STORAGE_KEY);
}

function setLeadId(id: string) {
  sessionStorage.setItem(LEAD_STORAGE_KEY, id);
}

export function clearLeadId() {
  sessionStorage.removeItem(LEAD_STORAGE_KEY);
}

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
