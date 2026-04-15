'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ClientData, GasAppData, ZoneData } from './types';
import type { RefrigerantV5, ZoneRegulationResult } from '@/lib/engine-types';
import type { ProductRecord, SelectorInput, BOMZone, DiscountRow } from '@/lib/m2-engine/types';
import { buildBOM } from '@/lib/m2-engine/build-bom';
import StepBOM from '@/components/selector/StepBOM';
import { type Lang } from './i18n';

interface Props {
  clientData: ClientData;
  gasAppData: GasAppData;
  zones: ZoneData[];
  refrigerant: RefrigerantV5;
  zoneRegulations: ZoneRegulationResult[];
  lang?: Lang;
}

export default function StepProducts({
  clientData, gasAppData, zones, refrigerant, zoneRegulations, lang = 'en',
}: Props) {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [discountMatrix, setDiscountMatrix] = useState<DiscountRow[]>([]);
  const [customerGroup, setCustomerGroup] = useState(clientData.customerGroup || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?discontinued=false').then(r => r.json()),
      fetch('/api/discount-matrix').then(r => r.json()).catch(() => []),
    ]).then(([prods, dm]) => {
      setProducts(prods);
      setDiscountMatrix(Array.isArray(dm) ? dm : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const selectorInput = useMemo((): SelectorInput => {
    const atexRequired = zoneRegulations.some(zr =>
      zr.result.extraRequirements.some(er => er.id === 'ATEX' && er.mandatory)
    );
    return {
      gasGroup: refrigerant.gasGroup,
      refrigerantRefs: [refrigerant.id],
      preferredFamily: gasAppData.selectedRange || undefined,
      voltage: gasAppData.sitePowerVoltage,
      atexRequired: gasAppData.zoneAtex || atexRequired,
      mountType: gasAppData.mountingType || 'wall',
      standalone: false,
    };
  }, [refrigerant, gasAppData, zoneRegulations]);

  const bomZones = useMemo((): BOMZone[] => {
    return zoneRegulations.map((zr) => ({
      name: zr.zoneName,
      detectorQty: zr.result.recommendedDetectors,
    }));
  }, [zoneRegulations]);

  const bomResult = useMemo(() => {
    if (products.length === 0) return null;
    return buildBOM(selectorInput, bomZones, products);
  }, [selectorInput, bomZones, products]);

  if (loading || !bomResult) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <StepBOM
      bom={bomResult}
      products={products}
      selectorInput={selectorInput}
      customerGroup={customerGroup}
      onCustomerGroupChange={setCustomerGroup}
      discountMatrix={discountMatrix}
    />
  );
}
