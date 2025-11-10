import {
  Pool,
  PoolCreateInput,
  PoolUpdateInput,
  PoolMember,
  PoolAllocation,
  PoolStatus,
} from '../domain/Pool';

export interface PoolRepository {
  findById(id: string): Promise<Pool | null>;
  findAll(): Promise<Pool[]>;
  findByStatus(status: PoolStatus): Promise<Pool[]>;
  findByShipId(shipId: string): Promise<Pool[]>;
  findActivePools(): Promise<Pool[]>;
  create(input: PoolCreateInput): Promise<Pool>;
  update(id: string, input: PoolUpdateInput): Promise<Pool>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  addMember(poolId: string, shipId: string, units: number): Promise<PoolMember>;
  removeMember(poolId: string, shipId: string): Promise<void>;
  getMembers(poolId: string): Promise<PoolMember[]>;
  allocateUnits(allocation: PoolAllocation): Promise<void>;
  getTotalAllocatedUnits(poolId: string): Promise<number>;
}

