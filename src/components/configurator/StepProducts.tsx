'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ClientData, GasAppData, ZoneData } from './types';
import type { RefrigerantV5, ZoneRegulationResult, SelectionInput, SelectionResult, PricingInput, PricingResult } from '@/lib/engine-types';
import type { ProductRecord, DiscountRow } from '@/lib/m2-engine/types';
import { toProductEntries } from '@/lib/m2-engine/parse-product';
import { selectProducts } from '@/lib/m2-engine/selection-engine';
import { calculatePricing } from '@/lib/m2-engine/pricing-engine';
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

const CUSTOMER_GROUPS = [
  '', 'EDC', 'OEM', '1Fo', '2Fo', '3Fo',
  '1Contractor', '2Contractor', '3Contractor',
  'AKund', 'BKund', 'NO',
];

export default function StepProducts({
  clientData, gasAppData, zones, refrigerant, zoneRegulations, application, spaceTypes = [], lang = 'en',
}: Props) {
  const [rawProducts, setRawProducts] = useState<ProductRecord[]>([]);
  const [discountMatrix, setDiscountMatrix] = useState<DiscountRow[]>([]);
  const [customerGroup, setCustomerGroup] = useState(clientData.customerGroup || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?discontinued=false').then(r => r.json()),
      fetch('/api/discount-matrix').then(r => r.json()).catch(() => []),
    ]).then(([prods, dm]) => {
      setRawProducts(prods);
      setDiscountMatrix(Array.isArray(dm) ? dm : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Parse raw products into engine-compatible ProductEntry arrays
  const { products, controllers, accessories } = useMemo(
    () => toProductEntries(rawProducts),
    [rawProducts],
  );

  // Total detectors from M1 regulation results
  const totalDetectors = useMemo(
    () => zoneRegulations.reduce((sum, zr) => sum + zr.result.recommendedDetectors, 0),
    [zoneRegulations],
  );

  // Build SelectionInput for the new engine
  const selectionInput = useMemo((): SelectionInput | null => {
    if (products.length === 0) return null;
    const atexRequired = zoneRegulations.some(zr =>
      zr.result.extraRequirements.some(er => er.id === 'ATEX' && er.mandatory)
    );
    const firstReg = zoneRegulations[0]?.result;
    return {
      regulationResult: firstReg,
      totalDetectors,
      selectedRefrigerant: refrigerant.id,
      selectedRange: gasAppData.selectedRange || undefined,
      zoneType: gasAppData.zoneType || 'supermarket',
      zoneAtex: gasAppData.zoneAtex || atexRequired,
      outputRequired: 'any',
      sitePowerVoltage: gasAppData.sitePowerVoltage,
      mountingType: gasAppData.mountingType || 'wall',
      projectCountry: clientData.country || 'SE',
      products,
      controllers,
      accessories,
      alertAccessory: undefined,
    };
  }, [products, controllers, accessories, refrigerant, gasAppData, zoneRegulations, totalDetectors, clientData]);

  // Run M2 selection engine
  const selectionResult = useMemo((): SelectionResult | null => {
    if (!selectionInput) return null;
    return selectProducts(selectionInput);
  }, [selectionInput]);

  // Build price DB from raw products
  const priceDb = useMemo(() => {
    const db = new Map<string, { price: number; productGroup: string; discontinued: boolean }>();
    for (const p of rawProducts) {
      db.set(p.code, { price: p.price, productGroup: p.productGroup || 'G', discontinued: p.discontinued });
    }
    return db;
  }, [rawProducts]);

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

  // Build image map from raw products (code → image filename)
  const productImages = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const p of rawProducts) {
      if (p.image) map[p.code] = p.image;
    }
    return map;
  }, [rawProducts]);

  // Run M3 pricing engine
  const pricingResult = useMemo((): PricingResult | null => {
    if (!selectionResult) return null;
    const pricingInput: PricingInput = {
      tiers: selectionResult.tiers,
      customerGroup: (customerGroup || 'NO') as PricingInput['customerGroup'],
      discountMatrix,
      priceDb,
    };
    return calculatePricing(pricingInput);
  }, [selectionResult, customerGroup, discountMatrix, priceDb]);

  if (loading || !selectionResult || !pricingResult) {
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

      {/* Product Recommendation */}
      <StepTieredBOM
        selectionResult={selectionResult}
        pricingResult={pricingResult}
        customerGroup={customerGroup}
        customerGroups={CUSTOMER_GROUPS}
        onCustomerGroupChange={setCustomerGroup}
        clientData={clientData}
        gasAppData={gasAppData}
        regulationResult={zoneRegulations[0]?.result}
        productImages={productImages}
        zoneCalcData={zoneCalcData}
      />
    </div>
  );
}
