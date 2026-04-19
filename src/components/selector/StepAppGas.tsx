'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Flame, Layers, Package, Check, Search, ChevronDown, X } from 'lucide-react';

interface AppOption {
  id: string;
  labelEn: string;
  icon: string;
  suggestedGases?: string;
}

interface RefOption {
  id: string;
  name: string;
  safetyClass: string;
  gasGroup?: string;
}

interface Props {
  applications: AppOption[];
  refrigerants: RefOption[];
  application: string;
  refrigerant: string;
  preferredFamily: string;
  onApplicationChange: (v: string) => void;
  onRefrigerantChange: (v: string) => void;
  onPreferredFamilyChange: (v: string) => void;
}

const FAMILIES = ['GLACIAR MIDI', 'X5 Direct Sensor Module', 'X5 Remote Sensor', 'X5 Transmitter'];

const inputClass = 'w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#16354B] focus:border-[#16354B] focus:ring-2 focus:ring-[#16354B]/20 outline-none transition-colors';
const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

/** Safety class badge color */
function safetyBadgeColor(sc: string): string {
  const upper = sc.toUpperCase();
  if (upper === 'A1') return 'bg-emerald-100 text-emerald-700 border-emerald-300';
  if (upper === 'A2L') return 'bg-amber-100 text-amber-700 border-amber-300';
  if (upper === 'A2') return 'bg-orange-100 text-orange-700 border-orange-300';
  if (upper === 'A3') return 'bg-red-100 text-red-700 border-red-300';
  if (upper === 'B1') return 'bg-blue-100 text-blue-700 border-blue-300';
  if (upper === 'B2L') return 'bg-pink-100 text-pink-700 border-pink-300';
  return 'bg-gray-100 text-gray-600 border-gray-300';
}

export default function StepAppGas({
  applications, refrigerants, application, refrigerant,
  preferredFamily, onApplicationChange, onRefrigerantChange,
  onPreferredFamilyChange,
}: Props) {
  const [refOpen, setRefOpen] = useState(false);
  const [refSearch, setRefSearch] = useState('');
  const refDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (refDropdownRef.current && !refDropdownRef.current.contains(e.target as Node)) {
        setRefOpen(false);
        setRefSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Selected refrigerant object
  const selectedRefObj = useMemo(() => {
    if (!refrigerant) return null;
    return refrigerants.find(r => r.id === refrigerant) ?? null;
  }, [refrigerant, refrigerants]);

  // Filtered refrigerants for search
  const filteredRefs = useMemo(() => {
    if (!refSearch) return refrigerants;
    const q = refSearch.toLowerCase();
    return refrigerants.filter(r =>
      r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
    );
  }, [refrigerants, refSearch]);

  return (
    <div className="space-y-5">

      {/* ── 1. Application ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-5 bg-[#E63946] rounded-full flex-shrink-0" />
          <Flame className="w-4 h-4 text-[#E63946]" />
          <h3 className="text-base font-bold text-[#16354B]">Application</h3>
        </div>

        <div>
          <label className={labelClass}>Select Application Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {applications.map(app => {
              const isSelected = application === app.id;
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => onApplicationChange(app.id)}
                  className={`relative flex flex-col items-center justify-center gap-1.5 px-3 py-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#16354B] text-white border-[#16354B] shadow-md'
                      : 'bg-white text-[#16354B] border-[#e2e8f0] hover:border-[#16354B]/40 hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-[#16354B]" />
                    </span>
                  )}
                  <span className="text-2xl leading-none">{app.icon}</span>
                  <span className="text-xs font-semibold leading-tight">{app.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. Refrigerant — Searchable Dropdown ──────────────── */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-5 bg-[#E63946] rounded-full flex-shrink-0" />
          <Layers className="w-4 h-4 text-[#E63946]" />
          <h3 className="text-base font-bold text-[#16354B]">Refrigerant</h3>
        </div>

        <div>
          <label className={labelClass}>Refrigerant</label>

          {/* Selected chip */}
          {selectedRefObj && (
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-2 bg-[#16354B] text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
                <span>{selectedRefObj.id}</span>
                <span className="text-white/70">&mdash;</span>
                <span className="text-white/90 font-normal">{selectedRefObj.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${safetyBadgeColor(selectedRefObj.safetyClass)}`}>
                  {selectedRefObj.safetyClass}
                </span>
                <button
                  type="button"
                  onClick={() => onRefrigerantChange('')}
                  className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {/* Dropdown container */}
          <div ref={refDropdownRef} className="relative">
            <div
              className={`flex items-center gap-2 ${inputClass} cursor-pointer`}
              onClick={() => setRefOpen(true)}
            >
              <Search className="w-4 h-4 text-[#6b8da5] flex-shrink-0" />
              {refOpen ? (
                <input
                  type="text"
                  autoFocus
                  className="flex-1 bg-transparent outline-none text-sm text-[#16354B] placeholder:text-[#6b8da5]"
                  placeholder="Search refrigerant (R744, R32, R717...)"
                  value={refSearch}
                  onChange={e => setRefSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') { setRefOpen(false); setRefSearch(''); } }}
                />
              ) : (
                <span className="flex-1 text-sm text-[#6b8da5]">
                  {selectedRefObj ? `${selectedRefObj.id} \u2014 ${selectedRefObj.name}` : 'Select refrigerant...'}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-[#6b8da5] transition-transform ${refOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown list */}
            {refOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border-2 border-[#e2e8f0] rounded-xl shadow-xl max-h-80 overflow-y-auto">
                {filteredRefs.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-[#6b8da5]">No results</div>
                ) : (
                  filteredRefs.map(r => {
                    const isActive = refrigerant === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => { onRefrigerantChange(r.id); setRefOpen(false); setRefSearch(''); }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-colors ${
                          isActive ? 'bg-[#16354B]/10' : 'hover:bg-[#f8fafc]'
                        }`}
                      >
                        <span className="text-sm font-semibold text-[#16354B] min-w-[65px]">{r.id}</span>
                        <span className="text-sm text-[#475569] flex-1 truncate">{r.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${safetyBadgeColor(r.safetyClass)}`}>
                          {r.safetyClass}
                        </span>
                        {isActive && <Check className="w-4 h-4 text-[#16354B] flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Preferred Product Range ──────────────────────────── */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-5 bg-[#16354B] rounded-full flex-shrink-0" />
          <Package className="w-4 h-4 text-[#16354B]" />
          <h3 className="text-base font-bold text-[#16354B]">Product Preference</h3>
        </div>

        <div>
          <label className={labelClass}>Preferred Product Range (optional)</label>
          <div className="relative">
            <select
              value={preferredFamily}
              onChange={e => onPreferredFamilyChange(e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="">No preference</option>
              {FAMILIES.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
