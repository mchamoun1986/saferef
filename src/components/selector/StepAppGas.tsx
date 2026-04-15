'use client';

import { useMemo } from 'react';

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
  gasGroup: string;
}

interface Props {
  applications: AppOption[];
  refrigerants: RefOption[];
  application: string;
  gasGroup: string;
  refrigerantRefs: string[];
  preferredFamily: string;
  onApplicationChange: (v: string) => void;
  onGasGroupChange: (v: string) => void;
  onRefrigerantRefsChange: (v: string[]) => void;
  onPreferredFamilyChange: (v: string) => void;
}

const GAS_GROUPS = ['CO2', 'HFC1', 'HFC2', 'NH3', 'R290', 'CO', 'NO2', 'O2'];
const FAMILIES = ['MIDI', 'X5', 'RM', 'Aquis'];

const inputClass = 'w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#16354B] focus:border-[#16354B] focus:ring-2 focus:ring-[#16354B]/20 outline-none transition-colors';
const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

export default function StepAppGas({
  applications, refrigerants, application, gasGroup, refrigerantRefs,
  preferredFamily, onApplicationChange, onGasGroupChange,
  onRefrigerantRefsChange, onPreferredFamilyChange,
}: Props) {
  const filteredRefs = useMemo(() => {
    if (!gasGroup) return refrigerants;
    return refrigerants.filter(r => r.gasGroup === gasGroup);
  }, [gasGroup, refrigerants]);

  function handleRefToggle(refId: string) {
    if (refrigerantRefs.includes(refId)) {
      onRefrigerantRefsChange(refrigerantRefs.filter(r => r !== refId));
    } else {
      onRefrigerantRefsChange([...refrigerantRefs, refId]);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#16354B]">Application & Gas</h2>

      <div>
        <label className={labelClass}>Application</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {applications.map(app => (
            <button
              key={app.id}
              onClick={() => onApplicationChange(app.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                application === app.id
                  ? 'border-[#16354B] bg-[#16354B]/5'
                  : 'border-[#e2e8f0] hover:border-[#16354B]/30'
              }`}
            >
              <span className="text-lg mr-2">{app.icon}</span>
              <span className="text-sm font-medium text-[#16354B]">{app.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Gas Group</label>
        <div className="flex flex-wrap gap-2">
          {GAS_GROUPS.map(g => (
            <button
              key={g}
              onClick={() => { onGasGroupChange(g); onRefrigerantRefsChange([]); }}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                gasGroup === g
                  ? 'border-[#E63946] bg-[#E63946]/10 text-[#E63946]'
                  : 'border-[#e2e8f0] text-[#6b8da5] hover:border-[#E63946]/30'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {gasGroup && (
        <div>
          <label className={labelClass}>Refrigerant(s)</label>
          <div className="flex flex-wrap gap-2">
            {filteredRefs.map(ref => (
              <button
                key={ref.id}
                onClick={() => handleRefToggle(ref.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  refrigerantRefs.includes(ref.id)
                    ? 'border-[#A7C031] bg-[#A7C031]/10 text-[#16354B]'
                    : 'border-[#e2e8f0] text-[#6b8da5] hover:border-[#A7C031]/30'
                }`}
              >
                {ref.id} - {ref.name} ({ref.safetyClass})
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>Preferred Product Range (optional)</label>
        <select
          value={preferredFamily}
          onChange={e => onPreferredFamilyChange(e.target.value)}
          className={inputClass}
        >
          <option value="">No preference</option>
          {FAMILIES.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
