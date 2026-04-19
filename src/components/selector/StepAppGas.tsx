'use client';

import { Flame, Layers, Package, Check } from 'lucide-react';

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

      {/* ── 2. Refrigerant ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-5 bg-[#E63946] rounded-full flex-shrink-0" />
          <Layers className="w-4 h-4 text-[#E63946]" />
          <h3 className="text-base font-bold text-[#16354B]">Refrigerant</h3>
        </div>

        <div>
          <label className={labelClass}>
            Select Refrigerant
            {refrigerant && (
              <span className="ml-2 text-[#A7C031] normal-case tracking-normal">
                {refrigerant} selected
              </span>
            )}
          </label>
          {refrigerants.length === 0 ? (
            <p className="text-xs text-[#6b8da5] italic py-2">Loading refrigerants...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {refrigerants.map(ref => {
                const isSelected = refrigerant === ref.id;
                return (
                  <button
                    key={ref.id}
                    type="button"
                    onClick={() => onRefrigerantChange(ref.id)}
                    className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-[#A7C031] bg-[#A7C031]/10 text-[#16354B] shadow-sm'
                        : 'border-[#e2e8f0] text-[#6b8da5] hover:border-[#A7C031]/40 hover:shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-[#A7C031] flex-shrink-0" />
                    )}
                    <span className="font-semibold">{ref.id}</span>
                    <span className={`hidden sm:inline ${isSelected ? 'text-[#16354B]/70' : 'text-[#6b8da5]/70'}`}>
                      {ref.name}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${safetyBadgeColor(ref.safetyClass)}`}>
                      {ref.safetyClass}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
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
