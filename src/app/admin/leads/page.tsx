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
                  <td className="py-3 px-3 text-gray-600">{lead.company || '\u2014'}</td>
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
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedLead.phone || '\u2014'}</span></div>
              <div><span className="text-gray-500">Company:</span> <span className="font-medium">{selectedLead.company || '\u2014'}</span></div>
              <div><span className="text-gray-500">Country:</span> <span className="font-medium">{selectedLead.country || '\u2014'}</span></div>
              <hr />
              <div><span className="text-gray-500">Source:</span> <span className="font-medium">{selectedLead.source}</span></div>
              <div><span className="text-gray-500">Current Step:</span> <span className="font-medium">{stepLabel(selectedLead.source, selectedLead.currentStep)} ({selectedLead.currentStep})</span></div>
              <div><span className="text-gray-500">Status:</span> <span className="font-medium">{selectedLead.status}</span></div>
              <hr />
              <div><span className="text-gray-500">Application:</span> <span className="font-medium">{selectedLead.application || '\u2014'}</span></div>
              <div><span className="text-gray-500">Refrigerant:</span> <span className="font-medium">{selectedLead.refrigerant || '\u2014'}</span></div>
              <div><span className="text-gray-500">Total Detectors:</span> <span className="font-medium">{selectedLead.totalDetectors || '\u2014'}</span></div>
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
