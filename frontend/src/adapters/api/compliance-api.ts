import { apiClient } from './api-client';

export interface Compliance {
  id: string;
  shipId: string;
  routeId: string;
  voyageId: string;
  fuelType: string;
  fuelConsumption: number;
  energyContent: number;
  ghgIntensity: number;
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING' | 'UNDER_REVIEW';
  reportingPeriod: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceMetrics {
  totalGhgEmissions: number;
  averageGhgIntensity: number;
  totalEnergyConsumed: number;
  complianceRate: number;
}

export interface CreateComplianceInput {
  shipId: string;
  routeId: string;
  voyageId: string;
  fuelType: string;
  fuelConsumption: number;
  energyContent: number;
  ghgIntensity: number;
  reportingPeriod: string;
}

export interface ComputeCBInput {
  actualGhgIntensity: number;
  fuelConsumption: number;
}

export interface ComputeCBResult {
  cb: number;
  target: number;
  actual: number;
  fuelConsumption: number;
  isSurplus: boolean;
}

export interface ComputeComparisonInput {
  actualGhgIntensity: number;
}

export interface ComputeComparisonResult {
  actual: number;
  target: number;
  difference: number;
  isCompliant: boolean;
}

export const complianceApi = {
  getAll: async (params?: {
    shipId?: string;
    routeId?: string;
    reportingPeriod?: string;
    status?: string;
  }): Promise<Compliance[]> => {
    const response = await apiClient.get('/compliance', { params });
    return response.data.compliances;
  },

  getById: async (id: string): Promise<Compliance> => {
    const response = await apiClient.get(`/compliance/${id}`);
    return response.data.compliance;
  },

  create: async (input: CreateComplianceInput): Promise<Compliance> => {
    const response = await apiClient.post('/compliance', input);
    return response.data.compliance;
  },

  computeCB: async (input: ComputeCBInput): Promise<ComputeCBResult> => {
    const response = await apiClient.post('/compliance/compute-cb', input);
    return response.data.result;
  },

  computeComparison: async (input: ComputeComparisonInput): Promise<ComputeComparisonResult> => {
    const response = await apiClient.post('/compliance/compute-comparison', input);
    return response.data.result;
  },

  getMetrics: async (id: string): Promise<ComplianceMetrics> => {
    const response = await apiClient.get(`/compliance/${id}/metrics`);
    return response.data.metrics;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/compliance/${id}`);
  },

  deleteAll: async (): Promise<void> => {
    await apiClient.delete('/compliance/all');
  },

  deleteByStatus: async (status: string): Promise<void> => {
    await apiClient.delete(`/compliance/status/${status}`);
  },
};

