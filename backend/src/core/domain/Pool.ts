export interface Pool {
  id: string;
  name: string;
  description?: string;
  poolType: PoolType;
  status: PoolStatus;
  startDate: Date;
  endDate: Date;
  totalComplianceUnits: number;
  allocatedComplianceUnits: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum PoolType {
  VOLUNTARY = 'VOLUNTARY',
  MANDATORY = 'MANDATORY',
  COMPANY = 'COMPANY',
  FLEET = 'FLEET',
}

export enum PoolStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export interface PoolMember {
  id: string;
  poolId: string;
  shipId: string;
  allocatedUnits: number;
  contribution: number; // percentage of pool's total compliance
  joinedAt: Date;
}

export interface PoolCreateInput {
  name: string;
  description?: string;
  poolType: PoolType;
  startDate: Date;
  endDate: Date;
  totalComplianceUnits?: number;
  allocatedComplianceUnits?: number;
}

export interface PoolUpdateInput {
  name?: string;
  description?: string;
  poolType?: PoolType;
  status?: PoolStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface PoolAllocation {
  poolId: string;
  shipId: string;
  units: number;
  allocationDate: Date;
}

