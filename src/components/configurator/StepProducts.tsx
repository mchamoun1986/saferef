'use client';

import { useState, useEffect, useMemo } from 'react';
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
    refs: p.refs,
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
  const [applications, setApplications] = useState<{ id: string; productFamilies?: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?status=active').then(r => r.json()),
      fetch('/api/applications').then(r => r.json()),
    ]).then(([prods, apps]) => {
      setRawProducts(Array.isArray(prods) ? prods : []);
      setApplications(Array.isArray(apps) ? apps : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Total detectors — use planDetectorCount (from ZonePlan cluster analysis) if set,
  // otherwise fall back to M1 recommendedDetectors. Same logic as StepCalcSheet.
  const totalDetectors = useMemo(
    () => zoneRegulations.reduce((sum, zr) => {
      const zone = zones.find(z => String(z.id) === zr.zoneId);
      return sum + (zone?.planDetectorCount ?? zr.result.recommendedDetectors);
    }, 0),
    [zoneRegulations, zones],
  );

  const [loading, setLoading] = useState(true);

  // Determine ATEX requirement from regulation results + user input
  const atexRequired = useMemo(
    () => gasAppData.zoneAtex || zoneRegulations.some(zr =>
      zr.result.extraRequirements.some(er => er.id === 'ATEX' && er.mandatory)
    ),
    [zoneRegulations, gasAppData.zoneAtex],
  );

  // Map voltage/location from gasAppData (set by Technical step)
  const voltageV2 = gasAppData.sitePowerVoltage === '12V' ? '12V DC' : gasAppData.sitePowerVoltage === '230V' ? '230V AC' : '24V DC/AC';
  const locationV2 = gasAppData.mountingType === 'duct' ? 'duct' : gasAppData.mountingType === 'pipe' || gasAppData.mountingType === 'pipe_valve' ? 'pipe' : 'ambient';

  // Look up application families for the selected application
  const applicationFamilies = useMemo(() => {
    const appId = gasAppData.zoneType;
    if (!appId) return undefined;
    const selectedApp = applications.find(a => a.id === appId);
    if (!selectedApp?.productFamilies) return undefined;
    try { return JSON.parse(selectedApp.productFamilies) as string[]; } catch { return undefined; }
  }, [gasAppData.zoneType, applications]);

  // Run SystemDesigner V2
  const solutions = useMemo((): Solution[] => {
    if (rawProducts.length === 0 || totalDetectors === 0) return [];
    const products = rawProducts.map(toProductV2);
    const designer = new SystemDesigner(products);
    return designer.generate({
      gas: refrigerant.id,
      atex: atexRequired,
      voltage: voltageV2,
      location: locationV2 as 'ambient' | 'duct' | 'pipe',
      outputs: [],
      measType: '',
      points: totalDetectors,
      application: gasAppData.zoneType || undefined,
      applicationFamilies,
    });
  }, [rawProducts, refrigerant, gasAppData.zoneType, atexRequired, totalDetectors, voltageV2, locationV2, applicationFamilies]);

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
        detectors: zone?.planDetectorCount ?? zr.result.recommendedDetectors,
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

      {/* Product Recommendation using V2 solutions */}
      <StepTieredBOM
        solutions={solutions}
        clientData={{ ...clientData, customerGroup: clientData.customerGroup || '' }}
        gasAppData={{
          zoneType: gasAppData.zoneType || '',
          selectedRefrigerant: refrigerant.id,
          selectedRange: '',
          sitePowerVoltage: gasAppData.sitePowerVoltage || '24V',
          zoneAtex: atexRequired,
          mountingType: gasAppData.mountingType || 'ambient',
        }}
        zoneCalcData={zoneCalcData}
      />
    </div>
  );
}
