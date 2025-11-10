import { apiClient } from './api-client';

export interface BankSurplusInput {
  surplusUnits: number;
  bankingDate: string;
  maxBankingCapacity?: number;
  bankingValidityYears?: number;
  shipId?: string;
}

export interface BankingResult {
  bankedUnits: number;
  originalSurplus: number;
  bankedAt: string;
  expiryDate: string;
  remainingSurplus: number;
}

export interface BankedUnit {
  id: string;
  units: number;
  bankedAt: string;
  expiryDate: string;
}

export interface ApplyBankedInput {
  deficit: number;
  applicationDate: string;
  availableBankedUnits: BankedUnit[];
}

export interface ApplicationResult {
  appliedUnits: number;
  remainingDeficit: number;
  usedBankedUnits: Array<{
    bankedUnitId: string;
    appliedAmount: number;
  }>;
  unusedBankedUnits: BankedUnit[];
}

export interface BankEntry {
  id: string;
  shipId: string;
  units: number;
  bankedAt: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export const bankingApi = {
  bankSurplus: async (input: BankSurplusInput): Promise<BankingResult> => {
    const response = await apiClient.post('/banking/bank-surplus', input);
    return response.data.result;
  },

  applyBanked: async (input: ApplyBankedInput): Promise<ApplicationResult> => {
    const response = await apiClient.post('/banking/apply-banked', input);
    return response.data.result;
  },

  getEntries: async (params?: { shipId?: string; expired?: boolean }): Promise<BankEntry[]> => {
    const response = await apiClient.get('/banking/entries', { params });
    return response.data.entries;
  },

  deleteEntry: async (id: string): Promise<void> => {
    await apiClient.delete(`/banking/entries/${id}`);
  },
};

