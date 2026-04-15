'use client';
import type { BOMZone } from '@/lib/m2-engine/types';
interface Props {
  zones: BOMZone[];
  onChange: (zones: BOMZone[]) => void;
}
export default function StepZoneQty(_props: Props) {
  return <div className="p-8 text-center text-gray-400">Step 3: Zones — Loading...</div>;
}
