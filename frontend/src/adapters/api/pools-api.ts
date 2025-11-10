import { apiClient } from './api-client';

export interface Pool {
  id: string;
  name: string;
  description?: string;
  poolType: 'VOLUNTARY' | 'MANDATORY' | 'COMPANY' | 'FLEET';
  status: 'ACTIVE' | 'CLOSED' | 'PENDING' | 'SUSPENDED';
  startDate: string;
  endDate: string;
  totalComplianceUnits: number;
  allocatedComplianceUnits: number;
  createdAt: string;
  updatedAt: string;
}

export interface PoolMember {
  id: string;
  poolId: string;
  shipId: string;
  allocatedUnits: number;
  contribution: number;
  joinedAt: string;
}

export interface CreatePoolInput {
  name: string;
  description?: string;
  poolType: 'VOLUNTARY' | 'MANDATORY' | 'COMPANY' | 'FLEET';
  startDate: string;
  endDate: string;
  totalComplianceUnits?: number;
  allocatedComplianceUnits?: number;
}

export const poolsApi = {
  getAll: async (params?: { status?: string; poolType?: string; shipId?: string }): Promise<Pool[]> => {
    const response = await apiClient.get('/pools', { params });
    return response.data.pools;
  },

  getById: async (id: string): Promise<Pool> => {
    const response = await apiClient.get(`/pools/${id}`);
    return response.data.pool;
  },

  create: async (input: CreatePoolInput): Promise<Pool> => {
    const response = await apiClient.post('/pools', input);
    return response.data.pool;
  },

  update: async (id: string, input: Partial<CreatePoolInput>): Promise<Pool> => {
    const response = await apiClient.put(`/pools/${id}`, input);
    return response.data.pool;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/pools/${id}`);
  },

  getMembers: async (id: string): Promise<PoolMember[]> => {
    const response = await apiClient.get(`/pools/${id}/members`);
    return response.data.members;
  },

  addMember: async (id: string, shipId: string, units: number): Promise<PoolMember> => {
    const response = await apiClient.post(`/pools/${id}/members`, { shipId, units });
    return response.data.member;
  },

  removeMember: async (id: string, shipId: string): Promise<void> => {
    await apiClient.delete(`/pools/${id}/members/${shipId}`);
  },

  allocateUnits: async (id: string, shipId: string, units: number): Promise<void> => {
    await apiClient.post(`/pools/${id}/allocate`, { shipId, units });
  },
};

