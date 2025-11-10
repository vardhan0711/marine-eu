/**
 * Applies previously banked compliance units to cover a deficit.
 * Pure function with no side effects - returns application result.
 */
export interface BankedUnit {
  id: string;
  units: number;
  bankedAt: Date;
  expiryDate: Date;
}

export interface ApplicationResult {
  applUnits: number;
  remainingDeficit: number;
  usedBankedUnits: Array<{
    bankedUnitId: string;
    appliedAmount: number;
  }>;
  unusedBankedUnits: BankedUnit[];
}

export interface ApplicationInput {
  deficit: number; // negative CB value (positive number representing deficit)
  availableBankedUnits: BankedUnit[];
  applicationDate: Date;
}

/**
 * Applies banked compliance units to cover a deficit.
 * Uses FIFO (First In, First Out) strategy - oldest units first.
 * Only uses units that haven't expired.
 * Returns the application result without modifying any external state.
 */
export function applyBanked(input: ApplicationInput): ApplicationResult {
  const { deficit, availableBankedUnits, applicationDate } = input;

  // Filter out expired units and sort by date (FIFO)
  const validUnits = availableBankedUnits
    .filter((unit) => unit.expiryDate >= applicationDate)
    .sort((a, b) => a.bankedAt.getTime() - b.bankedAt.getTime());

  let remainingDeficit = deficit;
  const usedBankedUnits: Array<{ bankedUnitId: string; appliedAmount: number }> = [];
  const unusedBankedUnits: BankedUnit[] = [];

  // Apply units until deficit is covered or no more units available
  for (const unit of validUnits) {
    if (remainingDeficit <= 0) {
      unusedBankedUnits.push(unit);
      continue;
    }

    const appliedAmount = Math.min(unit.units, remainingDeficit);
    remainingDeficit -= appliedAmount;

    usedBankedUnits.push({
      bankedUnitId: unit.id,
      appliedAmount,
    });

    // If unit is partially used, add remainder to unused
    if (appliedAmount < unit.units) {
      unusedBankedUnits.push({
        ...unit,
        units: unit.units - appliedAmount,
      });
    }
  }

  const applUnits = deficit - remainingDeficit;

  return {
    applUnits,
    remainingDeficit: Math.max(0, remainingDeficit),
    usedBankedUnits,
    unusedBankedUnits,
  };
}

