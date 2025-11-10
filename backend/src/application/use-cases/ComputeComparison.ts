/**
 * Computes the comparison between actual GHG intensity and target intensity.
 * Pure function with no side effects.
 */
export interface ComparisonResult {
  actual: number; // gCO2eq/MJ
  target: number; // gCO2eq/MJ (89.3368)
  difference: number; // target - actual
  isCompliant: boolean; // true if actual <= target
}

export function computeComparison(actualGhgIntensity: number): ComparisonResult {
  const TARGET = 89.3368;
  const difference = TARGET - actualGhgIntensity;
  const isCompliant = actualGhgIntensity <= TARGET;

  return {
    actual: actualGhgIntensity,
    target: TARGET,
    difference,
    isCompliant,
  };
}

