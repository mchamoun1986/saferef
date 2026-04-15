"use client";

import { Check } from "lucide-react";
import { type Lang, STEPS } from "./i18n";

interface StepProgressProps {
  current: number;
  lang?: Lang;
}

export default function StepProgress({ current: currentStep, lang = "en" }: StepProgressProps) {
  const stepLabels = STEPS[lang];
  const steps = stepLabels.map((label, i) => ({ label, icon: String(i + 1) }));
  return (
    <div className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] py-5 print:hidden">
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isDone = currentStep > stepNum;
          const isActive = currentStep === stepNum;

          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? "bg-[#A7C031] text-white shadow-[0_0_10px_rgba(167,192,49,0.4)]"
                      : isActive
                      ? "bg-[#E63946] text-white shadow-[0_0_10px_rgba(230,57,70,0.4)]"
                      : "border-2 border-[#2a4a60] text-[#4a7a95]"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : step.icon}
                </div>
                <span
                  className={`mt-2 text-[11px] font-semibold ${
                    isDone
                      ? "text-[#A7C031]"
                      : isActive
                      ? "text-white"
                      : "text-[#4a7a95]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-[3px] mx-4 mt-[-1rem] rounded-full ${
                    currentStep > stepNum ? "bg-[#A7C031]" : "bg-[#2a4a60]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
