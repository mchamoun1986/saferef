import type { SelectorInput, BOMZone, BOMLine, BOMResult, ProductRecord } from './types';
import { selectDetector } from './select-detector';
import { selectController } from './select-controller';
import { selectAccessories } from './select-accessories';

function toBOMLine(product: ProductRecord, qty: number, essential: boolean): BOMLine {
  return {
    productId: product.id,
    code: product.code,
    name: product.name,
    family: product.family,
    type: product.type as 'detector' | 'sensor' | 'controller' | 'alert' | 'accessory',
    unitPrice: product.price,
    productGroup: product.productGroup,
    qty,
    lineTotal: product.price * qty,
    essential,
  };
}

export function buildBOM(
  input: SelectorInput,
  zones: BOMZone[],
  products: ProductRecord[],
): BOMResult {
  const detectorCandidates = selectDetector(input, products);
  const bestDetector = detectorCandidates[0] ?? null;

  let totalDetectors = 0;
  const zoneBOMs = zones.map((zone) => {
    if (!bestDetector) {
      return { zoneName: zone.name, detector: null, accessories: [], subtotal: 0 };
    }

    totalDetectors += zone.detectorQty;
    const detLine = toBOMLine(bestDetector, zone.detectorQty, true);

    const { essential } = selectAccessories(
      bestDetector.family,
      input.gasGroup,
      input.mountType,
      products,
    );
    const accLines = essential.map((acc) => toBOMLine(acc, 1, true));

    const subtotal = detLine.lineTotal + accLines.reduce((s, a) => s + a.lineTotal, 0);
    return { zoneName: zone.name, detector: detLine, accessories: accLines, subtotal };
  });

  let controllerLine: BOMLine | null = null;
  if (!input.standalone && totalDetectors > 0) {
    const ctrl = selectController(totalDetectors, input.voltage, products);
    if (ctrl) {
      controllerLine = toBOMLine(ctrl, 1, true);
    }
  }

  const zonesTotal = zoneBOMs.reduce((s, z) => s + z.subtotal, 0);
  const ctrlTotal = controllerLine?.lineTotal ?? 0;
  const totalGross = zonesTotal + ctrlTotal;

  return {
    zones: zoneBOMs,
    controller: controllerLine,
    sharedAccessories: [],
    totalGross,
  };
}
