/**
 * Banks surplus compliance units.
 * Pure function with no side effects - returns banking result.
 */
export interface BankingResult {
  bankedUnits: number;
  originalSurplus: number;
  bankedAt: Date;
  expiryDate: Date;
  remainingSurplus: number; // if surplus exceeds max banking capacity
}

export interface BankingInput {
  surplusUnits: number; // positive CB value
  bankingDate: Date;
  maxBankingCapacity?: number; // optional limit on how much can be banked
  bankingValidityYears?: number; // years until banking expires (default: 2)
}

/**
 * Banks surplus compliance units.
 * Returns the banking result without modifying any external state.
 */
export function bankSurplus(input: BankingInput): BankingResult {
  const {
    surplusUnits,
    bankingDate,
    maxBankingCapacity = Infinity,
    bankingValidityYears = 2,
  } = input;

  const bankableUnits = Math.min(surplusUnits, maxBankingCapacity);
  const remainingSurplus = Math.max(0, surplusUnits - maxBankingCapacity);

  const expiryDate = new Date(bankingDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + bankingValidityYears);

  return {
    bankedUnits: bankableUnits,
    originalSurplus: surplusUnits,
    bankedAt: bankingDate,
    expiryDate,
    remainingSurplus,
  };
}

