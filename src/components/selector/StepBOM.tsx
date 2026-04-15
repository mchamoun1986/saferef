'use client';
import type { BOMResult, ProductRecord, SelectorInput, DiscountRow } from '@/lib/m2-engine/types';
interface Props {
  bom: BOMResult;
  products: ProductRecord[];
  selectorInput: SelectorInput;
  customerGroup: string;
  onCustomerGroupChange: (v: string) => void;
  discountMatrix?: DiscountRow[];
}
export default function StepBOM(_props: Props) {
  return <div className="p-8 text-center text-gray-400">Step 4: BOM — Loading...</div>;
}
