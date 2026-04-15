"use client";

import { Shield, User, FolderOpen, BadgePercent } from "lucide-react";
import type { ClientData } from "./types";
import { type Lang, CLIENT } from "./i18n";

interface StepClientProps {
  data: ClientData;
  onChange: (data: ClientData) => void;
  lang?: Lang;
  showCommercial?: boolean;
}

const countries = [
  { value: "FR", label: "France" },
  { value: "SE", label: "Sweden" },
  { value: "UK", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
  { value: "CH", label: "Switzerland" },
  { value: "AT", label: "Austria" },
  { value: "NO", label: "Norway" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
  { value: "PL", label: "Poland" },
  { value: "CZ", label: "Czech Republic" },
  { value: "PT", label: "Portugal" },
  { value: "IE", label: "Ireland" },
  { value: "GR", label: "Greece" },
  { value: "RO", label: "Romania" },
  { value: "HU", label: "Hungary" },
  { value: "OTHER", label: "Other" },
];

const customerGroups = [
  { value: "NO", label: "End User" },
  { value: "BKund", label: "Small Contractor (BKund)" },
  { value: "AKund", label: "Mid-size Contractor (AKund)" },
  { value: "3Contractor", label: "Contractor (3Contractor)" },
  { value: "2Contractor", label: "Large Contractor (2Contractor)" },
  { value: "1Contractor", label: "Global Contractor (1Contractor)" },
  { value: "3Fo", label: "Small Distributor (3Fo)" },
  { value: "2Fo", label: "Distributor (2Fo)" },
  { value: "1Fo", label: "Global Large Distributor (1Fo)" },
  { value: "OEM", label: "OEM" },
  { value: "EDC", label: "EDC" },
];

export default function StepClient({ data, onChange, lang = "en", showCommercial = false }: StepClientProps) {
  const update = <K extends keyof ClientData>(field: K, value: ClientData[K]) => {
    onChange({ ...data, [field]: value });
  };

  const inputClass =
    "w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#16354B] focus:border-[#16354B] focus:ring-2 focus:ring-[#16354B]/20 outline-none transition-colors";

  const labelClass = "block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5";

  const t = CLIENT[lang];

  return (
    <div className="space-y-5">

      {/* RGPD Consent — compact */}
      <div className="bg-[#f8fafc] rounded-lg border border-[#e2e8f0] px-4 py-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#16354B] flex-shrink-0"
            checked={data.rgpdConsent}
            onChange={(e) => update("rgpdConsent", e.target.checked)}
          />
          <span className="text-xs text-[#6b8da5]">{t.rgpdText}</span>
        </label>
      </div>

      {/* Client Info */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-[#E63946] rounded-full" />
          <User className="w-5 h-5 text-[#E63946]" />
          <h3 className="text-sm font-bold text-[#16354B]">{t.clientInfo}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t.firstName}</label>
            <input
              type="text"
              className={inputClass}
              value={data.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>{t.lastName}</label>
            <input
              type="text"
              className={inputClass}
              value={data.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>{t.company}</label>
            <input
              type="text"
              className={inputClass}
              value={data.company}
              onChange={(e) => update("company", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>{t.email}</label>
            <input
              type="email"
              className={inputClass}
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>{t.phone}</label>
            <input
              type="tel"
              className={inputClass}
              value={data.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>{t.clientType}</label>
            <select
              className={inputClass}
              value={data.clientType}
              onChange={(e) => update("clientType", e.target.value)}
            >
              <option value="">{t.selectType}</option>
              <option value="distributor">{t.typeDistributor}</option>
              <option value="installer">{t.typeInstaller}</option>
              <option value="end_user">{t.typeEndUser}</option>
              <option value="engineer">{t.typeEngineer}</option>
              <option value="oem">{t.typeOEM}</option>
              <option value="other">{t.typeOther}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-[#E63946] rounded-full" />
          <FolderOpen className="w-5 h-5 text-[#E63946]" />
          <h3 className="text-sm font-bold text-[#16354B]">{t.projectInfo}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t.projectName}</label>
            <input
              type="text"
              className={inputClass}
              value={data.projectName}
              onChange={(e) => update("projectName", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>{t.country}</label>
            <select
              className={inputClass}
              value={data.country}
              onChange={(e) => update("country", e.target.value)}
            >
              <option value="">{t.selectCountry}</option>
              {countries.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Commercial Info — only shown in sales context */}
      {showCommercial && <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-[#E63946] rounded-full" />
          <BadgePercent className="w-5 h-5 text-[#E63946]" />
          <h3 className="text-sm font-bold text-[#16354B]">{t.commercialInfo}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t.customerGroup}</label>
            <select
              className={inputClass}
              value={data.customerGroup}
              onChange={(e) => update("customerGroup", e.target.value)}
            >
              <option value="">{t.selectGroup}</option>
              {customerGroups.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t.discountCode}</label>
            <input
              type="text"
              className={inputClass}
              value={data.discountCode}
              onChange={(e) => update("discountCode", e.target.value)}
              placeholder="e.g. PROMO2026"
            />
          </div>
        </div>
      </div>}

    </div>
  );
}
