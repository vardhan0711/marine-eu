/**
 * Computes Compliance Balance (CB) using the formula:
 * CB = (target − actual) × fuel × 41000
 * where target = 89.3368
 * 
 * Pure function with no side effects.
 */
export interface ComplianceBalanceResult {
  cb: number; // Compliance Balance
  target: number; // 89.3368
  actual: number; // gCO2eq/MJ
  fuelConsumption: number; // metric tons
  isSurplus: boolean; // true if CB > 0 (surplus), false if deficit
}

export function computeCB(
  actualGhgIntensity: number, // gCO2eq/MJ
  fuelConsumption: number // metric tons
): ComplianceBalanceResult {
  const TARGET = 89.3368;
  const cb = (TARGET - actualGhgIntensity) * fuelConsumption * 41000;
  const isSurplus = cb > 0;

  return {
    cb,
    target: TARGET,
    actual: actualGhgIntensity,
    fuelConsumption,
    isSurplus,
  };
}

