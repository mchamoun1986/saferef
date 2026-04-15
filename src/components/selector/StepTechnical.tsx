'use client';

const inputClass = 'w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#16354B] focus:border-[#16354B] focus:ring-2 focus:ring-[#16354B]/20 outline-none transition-colors';
const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

const VOLTAGES = ['12V', '24V', '230V'] as const;
const MOUNTS = [
  { value: 'wall', label: 'Wall' },
  { value: 'ceiling', label: 'Ceiling' },
  { value: 'duct', label: 'Duct' },
  { value: 'floor', label: 'Floor' },
  { value: 'pipe', label: 'Pipe' },
  { value: 'pole', label: 'Pole' },
];

interface Props {
  voltage: '12V' | '24V' | '230V';
  atexRequired: boolean;
  mountType: string;
  standalone: boolean;
  onVoltageChange: (v: '12V' | '24V' | '230V') => void;
  onAtexChange: (v: boolean) => void;
  onMountChange: (v: string) => void;
  onStandaloneChange: (v: boolean) => void;
}

export default function StepTechnical({
  voltage, atexRequired, mountType, standalone,
  onVoltageChange, onAtexChange, onMountChange, onStandaloneChange,
}: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#16354B]">Technical Requirements</h2>

      <div>
        <label className={labelClass}>Site Voltage</label>
        <div className="flex gap-3">
          {VOLTAGES.map(v => (
            <button
              key={v}
              onClick={() => onVoltageChange(v)}
              className={`flex-1 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
                voltage === v
                  ? 'border-[#16354B] bg-[#16354B] text-white'
                  : 'border-[#e2e8f0] text-[#6b8da5] hover:border-[#16354B]/30'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>ATEX Zone</label>
        <div className="flex gap-3">
          <button
            onClick={() => onAtexChange(false)}
            className={`flex-1 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
              !atexRequired ? 'border-[#A7C031] bg-[#A7C031]/10 text-[#16354B]' : 'border-[#e2e8f0] text-[#6b8da5]'
            }`}
          >
            Non-ATEX
          </button>
          <button
            onClick={() => onAtexChange(true)}
            className={`flex-1 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
              atexRequired ? 'border-[#E63946] bg-[#E63946]/10 text-[#E63946]' : 'border-[#e2e8f0] text-[#6b8da5]'
            }`}
          >
            ATEX Required
          </button>
        </div>
      </div>

      <div>
        <label className={labelClass}>Mounting Type</label>
        <select value={mountType} onChange={e => onMountChange(e.target.value)} className={inputClass}>
          {MOUNTS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Operation Mode</label>
        <div className="flex gap-3">
          <button
            onClick={() => onStandaloneChange(false)}
            className={`flex-1 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
              !standalone ? 'border-[#16354B] bg-[#16354B]/10 text-[#16354B]' : 'border-[#e2e8f0] text-[#6b8da5]'
            }`}
          >
            With Controller
          </button>
          <button
            onClick={() => onStandaloneChange(true)}
            className={`flex-1 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
              standalone ? 'border-[#16354B] bg-[#16354B]/10 text-[#16354B]' : 'border-[#e2e8f0] text-[#6b8da5]'
            }`}
          >
            Standalone
          </button>
        </div>
      </div>
    </div>
  );
}
