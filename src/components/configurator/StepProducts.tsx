'use client';

import { useState, useEffect, useMemo } from 'react';
import { Zap, MapPin, ShieldAlert } from 'lucide-react';
import type { ClientData, GasAppData, ZoneData } from './types';
import type { RefrigerantV5, ZoneRegulationResult } from '@/lib/engine-types';
import type { ProductRecord } from '@/lib/m2-engine/types';
import type { ProductV2, Solution } from '@/lib/m2-engine/designer-types';
import { SystemDesigner } from '@/lib/m2-engine/selection-engine';
import StepTieredBOM from '@/components/selector/StepTieredBOM';
import StepCalcSheet from './StepCalcSheet';
import { type Lang } from './i18n';

interface SpaceTypeOption {
  id: string;
  labelFr: string;
  labelEn: string;
  icon: string;
}

interface Props {
  clientData: ClientData;
  gasAppData: GasAppData;
  zones: ZoneData[];
  refrigerant: RefrigerantV5;
  zoneRegulations: ZoneRegulationResult[];
  application?: { id: string; labelFr: string; labelEn: string; icon: string } | null;
  spaceTypes?: SpaceTypeOption[];
  lang?: Lang;
}

/** Cast a ProductRecord (API shape) to ProductV2 (engine shape) */
function toProductV2(p: ProductRecord): ProductV2 {
  return {
    id: p.id,
    type: p.type,
    family: p.family,
    name: p.name,
    code: p.code,
    price: p.price,
    image: p.image ?? null,
    specs: p.specs ?? '',
    tier: p.tier || 'standard',
    productGroup: p.productGroup || 'G',
    gas: p.gas,
    refs: p.refs,
    apps: p.apps,
    range: p.range,
    sensorTech: p.sensorTech,
    sensorLife: p.sensorLife ?? null,
    power: p.power ?? null,
    voltage: p.voltage,
    ip: p.ip ?? null,
    tempMin: p.tempMin ?? null,
    tempMax: p.tempMax ?? null,
    relay: p.relay ?? 0,
    analog: p.analog,
    modbus: p.modbus ?? false,
    standalone: p.standalone ?? false,
    atex: p.atex ?? false,
    mount: typeof p.mount === 'string' ? p.mount : JSON.stringify(p.mount),
    remote: p.remote ?? false,
    features: p.features ?? null,
    connectTo: p.connectTo ?? null,
    discontinued: p.discontinued ?? false,
    channels: p.channels ?? null,
    maxPower: p.maxPower ?? null,
    subCategory: p.subCategory ?? null,
    compatibleFamilies: p.compatibleFamilies ?? '[]',
    // V2 fields
    variant: p.variant ?? null,
    subType: p.subType ?? null,
    function: p.function ?? null,
    status: p.status ?? 'active',
    ports: p.ports ?? '[]',
    connectionRules: p.connectionRules ?? '{}',
    compatibleWith: p.compatibleWith ?? '[]',
  };
}

export default function StepProducts({
  clientData, gasAppData, zones, refrigerant, zoneRegulations, application, spaceTypes = [], lang = 'en',
}: Props) {
  const [rawProducts, setRawProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Technical inputs — local state (user adjustable)
  const [siteVoltage, setSiteVoltage] = useState<'12V' | '24V' | '230V'>(gasAppData.sitePowerVoltage || '24V');
  const [detectionLocation, setDetectionLocation] = useState<'ambient' | 'duct' | 'pipe'>(
    gasAppData.mountingType === 'duct' ? 'duct' : gasAppData.mountingType === 'pipe' || gasAppData.mountingType === 'pipe_valve' ? 'pipe' : 'ambient'
  );
  const [atexOverride, setAtexOverride] = useState<boolean>(gasAppData.zoneAtex || false);

  useEffect(() => {
    fetch('/api/products?status=active')
      .then(r => r.json())
      .then((prods) => {
        setRawProducts(Array.isArray(prods) ? prods : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Total detectors from M1 regulation results
  const totalDetectors = useMemo(
    () => zoneRegulations.reduce((sum, zr) => sum + zr.result.recommendedDetectors, 0),
    [zoneRegulations],
  );

  // Determine ATEX requirement from regulation results
  const atexFromM1 = useMemo(
    () => zoneRegulations.some(zr =>
      zr.result.extraRequirements.some(er => er.id === 'ATEX' && er.mandatory)
    ),
    [zoneRegulations],
  );
  const atexRequired = atexOverride || atexFromM1;

  // Map voltage format for V2 engine
  const voltageV2 = siteVoltage === '12V' ? '12V DC' : siteVoltage === '230V' ? '230V AC' : '24V DC/AC';

  // Run SystemDesigner V2
  const solutions = useMemo((): Solution[] => {
    if (rawProducts.length === 0 || totalDetectors === 0) return [];
    const products = rawProducts.map(toProductV2);
    const designer = new SystemDesigner(products);
    return designer.generate({
      gas: refrigerant.id,
      atex: atexRequired,
      voltage: voltageV2,
      location: detectionLocation,
      outputs: [],
      measType: '',
      points: totalDetectors,
      application: gasAppData.zoneType || undefined,
    });
  }, [rawProducts, refrigerant, gasAppData.zoneType, atexRequired, totalDetectors, voltageV2, detectionLocation]);

  // Build zone calc data for PDF report
  const zoneCalcData = useMemo(() => {
    return zoneRegulations.map((zr, idx) => {
      const zone = zones[idx];
      return {
        zoneName: zone?.name || `Zone ${idx + 1}`,
        surface: zone?.surface || 0,
        height: zone?.height || 0,
        charge: zone?.charge || 0,
        volume: zone?.volumeOverride || (zone?.surface || 0) * (zone?.height || 0),
        detectionRequired: zr.result.detectionRequired,
        detectors: zr.result.recommendedDetectors,
        thresholdPpm: zr.result.thresholdPpm,
        placement: zr.result.placementHeight,
        placementM: zr.result.placementHeightM,
      };
    });
  }, [zones, zoneRegulations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* CalcSheet summary (read-only recap) */}
      <details className="group">
        <summary className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-[#16354B] bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors">
          <span className="text-gray-400 group-open:rotate-90 transition-transform">▸</span>
          Calculation Sheet — Regulatory Analysis
          <span className="ml-auto text-xs text-gray-400 font-normal">Click to expand</span>
        </summary>
        <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
          <StepCalcSheet
            clientData={clientData}
            gasAppData={gasAppData}
            zones={zones}
            refrigerant={refrigerant}
            application={application ?? null}
            spaceTypes={spaceTypes}
            zoneRegulations={zoneRegulations}
            lang={lang}
          />
        </div>
      </details>

      {/* Technical Parameters — user adjustable */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5">
        <h3 className="text-sm font-bold text-[#16354B] mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#E63946]" />
          Site Configuration
          <span className="text-xs font-normal text-gray-400 ml-2">
            {totalDetectors} detector{totalDetectors !== 1 ? 's' : ''} required by regulation
          </span>
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {/* Voltage */}
          <div>
            <label className="block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-2">Site Voltage</label>
            <div className="flex gap-1.5">
              {(['12V', '24V', '230V'] as const).map(v => (
                <button key={v} type="button" onClick={() => setSiteVoltage(v)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    siteVoltage === v
                      ? 'bg-[#16354B] text-white shadow-sm'
                      : 'bg-[#f8fafc] border border-[#e2e8f0] text-[#6b8da5] hover:border-[#16354B]'
                  }`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          {/* Detection Location */}
          <div>
            <label className="block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-2">Detection Location</label>
            <div className="flex gap-1.5">
              {([
                { value: 'ambient' as const, label: 'Ambient' },
                { value: 'duct' as const, label: 'Duct' },
                { value: 'pipe' as const, label: 'Pipe' },
              ]).map(loc => (
                <button key={loc.value} type="button" onClick={() => setDetectionLocation(loc.value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                    detectionLocation === loc.value
                      ? 'bg-[#16354B] text-white shadow-sm'
                      : 'bg-[#f8fafc] border border-[#e2e8f0] text-[#6b8da5] hover:border-[#16354B]'
                  }`}>
                  <MapPin className="w-3 h-3" />
                  {loc.label}
                </button>
              ))}
            </div>
          </div>
          {/* ATEX */}
          <div>
            <label className="block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-2">ATEX Zone</label>
            <button type="button" onClick={() => setAtexOverride(!atexOverride)}
              className={`w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                atexRequired
                  ? 'bg-red-50 border-2 border-red-300 text-red-700'
                  : 'bg-[#f8fafc] border border-[#e2e8f0] text-[#6b8da5] hover:border-[#16354B]'
              }`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              {atexRequired ? 'ATEX Required' : 'Non-ATEX'}
              {atexFromM1 && <span className="text-[9px] opacity-60">(from regulation)</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Product Recommendation using V2 solutions */}
      <StepTieredBOM
        solutions={solutions}
        clientData={{ ...clientData, customerGroup: clientData.customerGroup || '' }}
        gasAppData={{
          zoneType: gasAppData.zoneType || '',
          selectedRefrigerant: refrigerant.id,
          selectedRange: '',
          sitePowerVoltage: siteVoltage,
          zoneAtex: atexRequired,
          mountingType: detectionLocation,
        }}
        zoneCalcData={zoneCalcData}
      />
    </div>
  );
}
