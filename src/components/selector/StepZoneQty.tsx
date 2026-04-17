'use client';

import { MapPin, Plus, Trash2, Hash } from 'lucide-react';
import type { BOMZone } from '@/lib/m2-engine/types';

const inputClass = 'w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#16354B] focus:border-[#16354B] focus:ring-2 focus:ring-[#16354B]/20 outline-none transition-colors';
const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

interface Props {
  zones: BOMZone[];
  onChange: (zones: BOMZone[]) => void;
}

export default function StepZoneQty({ zones, onChange }: Props) {
  function addZone() {
    onChange([...zones, { name: `Zone ${zones.length + 1}`, detectorQty: 1 }]);
  }

  function removeZone(index: number) {
    if (zones.length <= 1) return;
    onChange(zones.filter((_, i) => i !== index));
  }

  function updateZone(index: number, field: 'name' | 'detectorQty', value: string | number) {
    const updated = zones.map((z, i) => {
      if (i !== index) return z;
      if (field === 'detectorQty') return { ...z, detectorQty: Math.max(1, Number(value)) };
      return { ...z, name: String(value) };
    });
    onChange(updated);
  }

  const totalDetectors = zones.reduce((s, z) => s + z.detectorQty, 0);

  return (
    <div className="space-y-5">

      {/* ── Zone List Card ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-5 bg-[#E63946] rounded-full flex-shrink-0" />
            <MapPin className="w-4 h-4 text-[#E63946]" />
            <h3 className="text-base font-bold text-[#16354B]">Zones & Quantities</h3>
          </div>
          <div className="flex items-center gap-2 bg-[#16354B]/5 px-3 py-1.5 rounded-lg">
            <Hash className="w-3.5 h-3.5 text-[#16354B]" />
            <span className="text-sm font-bold text-[#16354B]">{totalDetectors}</span>
            <span className="text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider">
              detector{totalDetectors !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Zone cards */}
        <div className="space-y-3">
          {zones.map((zone, i) => (
            <div
              key={i}
              className="bg-white border-l-4 border-[#A7C031] rounded-xl shadow-[0_2px_8px_rgba(22,53,75,0.07)] p-4 transition-all hover:shadow-[0_4px_16px_rgba(22,53,75,0.1)]"
            >
              <div className="flex items-start gap-4">
                {/* Zone number badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#16354B] flex items-center justify-center mt-5">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>

                {/* Fields */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
                  <div>
                    <label className={labelClass}>Zone Name</label>
                    <input
                      type="text"
                      value={zone.name}
                      onChange={e => updateZone(i, 'name', e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Cold Room 1"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Detectors</label>
                    <input
                      type="number"
                      min={1}
                      value={zone.detectorQty}
                      onChange={e => updateZone(i, 'detectorQty', e.target.value)}
                      className={`${inputClass} text-center`}
                    />
                  </div>
                </div>

                {/* Delete button */}
                {zones.length > 1 && (
                  <button
                    onClick={() => removeZone(i)}
                    className="flex-shrink-0 mt-5 w-8 h-8 flex items-center justify-center rounded-lg border-2 border-transparent text-red-300 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                    title="Remove zone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add zone button */}
        <button
          onClick={addZone}
          className="mt-4 w-full py-3.5 border-2 border-dashed border-[#e2e8f0] rounded-xl text-[#6b8da5] hover:border-[#A7C031] hover:text-[#A7C031] hover:bg-[#A7C031]/5 transition-all flex items-center justify-center gap-2 font-semibold text-sm group"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
          Add Zone
        </button>
      </div>
    </div>
  );
}
