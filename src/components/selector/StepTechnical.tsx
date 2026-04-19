'use client';

import { Zap, ShieldAlert, Monitor, Cpu, Check } from 'lucide-react';

const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

const VOLTAGES = ['12V', '24V', '230V'] as const;

const DETECTION_LOCATIONS = [
  { value: 'ambient', label: 'Ambient Detection', icon: '🌬️', description: 'Gas detection in the room air environment. Standard wall-mounted detector with exposed sensor.' },
  { value: 'duct', label: 'Duct Detection', icon: '🌀', description: 'Gas detection inside HVAC ducts or ventilation systems. Requires duct sampling probe.' },
  { value: 'pipe_valve', label: 'Pipe / Valve Detection', icon: '🔧', description: 'Leak detection directly on piping or valves. Close-proximity sensor placement.' },
];

interface Props {
  voltage: '12V' | '24V' | '230V';
  atexRequired: boolean;
  mountType: string;
  onVoltageChange: (v: '12V' | '24V' | '230V') => void;
  onAtexChange: (v: boolean) => void;
  onMountChange: (v: string) => void;
}

export default function StepTechnical({
  voltage, atexRequired, mountType,
  onVoltageChange, onAtexChange, onMountChange,
}: Props) {
  return (
    <div className="space-y-5">

      {/* ── 1. Site Voltage ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-5 bg-[#E63946] rounded-full flex-shrink-0" />
          <Zap className="w-4 h-4 text-[#E63946]" />
          <h3 className="text-base font-bold text-[#16354B]">Site Voltage</h3>
        </div>

        <div>
          <label className={labelClass}>Select power supply</label>
          <div className="grid grid-cols-3 gap-3">
            {VOLTAGES.map(v => {
              const isSelected = voltage === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onVoltageChange(v)}
                  className={`relative flex flex-col items-center justify-center gap-1 py-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#16354B] text-white border-[#16354B] shadow-md'
                      : 'bg-white text-[#6b8da5] border-[#e2e8f0] hover:border-[#16354B]/40 hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-[#16354B]" />
                    </span>
                  )}
                  <Zap className={`w-5 h-5 ${isSelected ? 'text-yellow-300' : 'text-[#6b8da5]'}`} />
                  <span className="text-lg font-bold">{v}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. ATEX Zone ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-5 bg-[#E63946] rounded-full flex-shrink-0" />
          <ShieldAlert className="w-4 h-4 text-[#E63946]" />
          <h3 className="text-base font-bold text-[#16354B]">ATEX Classification</h3>
        </div>

        <div>
          <label className={labelClass}>Hazardous area classification</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onAtexChange(false)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                !atexRequired
                  ? 'border-[#A7C031] bg-[#A7C031]/5 shadow-sm'
                  : 'border-[#e2e8f0] bg-white hover:border-[#A7C031]/40 hover:shadow-sm'
              }`}
            >
              {!atexRequired && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#A7C031] rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </span>
              )}
              <span className="text-2xl">✅</span>
              <span className={`text-sm font-bold ${!atexRequired ? 'text-[#16354B]' : 'text-[#6b8da5]'}`}>
                Non-ATEX
              </span>
              <span className="text-[10px] text-[#6b8da5] text-center leading-tight">
                Standard installation zone
              </span>
            </button>

            <button
              type="button"
              onClick={() => onAtexChange(true)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                atexRequired
                  ? 'border-[#E63946] bg-[#E63946]/5 shadow-sm'
                  : 'border-[#e2e8f0] bg-white hover:border-[#E63946]/40 hover:shadow-sm'
              }`}
            >
              {atexRequired && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#E63946] rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </span>
              )}
              <ShieldAlert className={`w-6 h-6 ${atexRequired ? 'text-[#E63946]' : 'text-[#6b8da5]'}`} />
              <span className={`text-sm font-bold ${atexRequired ? 'text-[#E63946]' : 'text-[#6b8da5]'}`}>
                ATEX Required
              </span>
              <span className="text-[10px] text-[#6b8da5] text-center leading-tight">
                Explosive atmosphere zone
              </span>
            </button>
          </div>

          {atexRequired && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 leading-relaxed">
                ATEX-certified detectors will be selected. Only EX-approved products are shown.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Detection Location ─────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-5 bg-[#E63946] rounded-full flex-shrink-0" />
          <Monitor className="w-4 h-4 text-[#E63946]" />
          <h3 className="text-base font-bold text-[#16354B]">Detection Location</h3>
        </div>

        <div>
          <label className={labelClass}>Where is the detector installed?</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DETECTION_LOCATIONS.map(m => {
              const isSelected = mountType === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => onMountChange(m.value)}
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
                  <span className="text-xl leading-none">{m.icon}</span>
                  <span className="text-xs font-semibold leading-tight">{m.label}</span>
                  <span className={`text-[9px] leading-tight ${isSelected ? 'text-white/70' : 'text-[#6b8da5]'}`}>
                    {m.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operation Mode removed — engine generates both standalone + centralized */}
    </div>
  );
}
