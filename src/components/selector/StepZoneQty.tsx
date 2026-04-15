'use client';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#16354B]">Zones &amp; Quantities</h2>
        <span className="text-sm font-semibold text-[#6b8da5]">
          Total: {totalDetectors} detector{totalDetectors !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {zones.map((zone, i) => (
          <div key={i} className="flex items-end gap-3 p-4 bg-white border-2 border-[#e2e8f0] rounded-lg">
            <div className="flex-1">
              <label className={labelClass}>Zone Name</label>
              <input
                type="text"
                value={zone.name}
                onChange={e => updateZone(i, 'name', e.target.value)}
                className={inputClass}
                placeholder="e.g. Cold Room 1"
              />
            </div>
            <div className="w-32">
              <label className={labelClass}>Detectors</label>
              <input
                type="number"
                min={1}
                value={zone.detectorQty}
                onChange={e => updateZone(i, 'detectorQty', e.target.value)}
                className={inputClass}
              />
            </div>
            {zones.length > 1 && (
              <button
                onClick={() => removeZone(i)}
                className="text-red-400 hover:text-red-600 p-2 transition-colors"
                title="Remove zone"
              >
                &#x2715;
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addZone}
        className="w-full py-3 border-2 border-dashed border-[#A7C031] text-[#A7C031] font-semibold rounded-lg hover:bg-[#A7C031]/5 transition-colors"
      >
        + Add Zone
      </button>
    </div>
  );
}
