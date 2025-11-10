import {
  Pool,
  PoolCreateInput,
  PoolUpdateInput,
  PoolMember,
  PoolAllocation,
  PoolStatus,
  PoolType,
} from '../../../core/domain/Pool';
import { PoolRepository } from '../../../core/ports/PoolRepository';
import { prisma } from './prisma-client';

export class PrismaPoolRepository implements PoolRepository {
  async findById(id: string): Promise<Pool | null> {
    const pool = await prisma.pool.findUnique({
      where: { id },
    });

    return pool ? this.toDomain(pool) : null;
  }

  async findAll(): Promise<Pool[]> {
    const pools = await prisma.pool.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return pools.map(this.toDomain);
  }

  async findByStatus(status: PoolStatus): Promise<Pool[]> {
    const pools = await prisma.pool.findMany({
      where: { status: status as PoolStatus },
      orderBy: { createdAt: 'desc' },
    });

    return pools.map(this.toDomain);
  }

  async findByShipId(shipId: string): Promise<Pool[]> {
    // Find pools where shipId is in vesselIds array or matches companyId
    const poolMembers = await prisma.poolMember.findMany({
      where: {
        OR: [
          { companyId: shipId },
          { vesselIds: { has: shipId } },
        ],
      },
      include: { pool: true },
    });

    return poolMembers.map((pm) => this.toDomain(pm.pool));
  }

  async findActivePools(): Promise<Pool[]> {
    const pools = await prisma.pool.findMany({
      where: { status: PoolStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });

    return pools.map(this.toDomain);
  }

  async create(input: PoolCreateInput): Promise<Pool> {
    const pool = await prisma.pool.create({
      data: {
        name: input.name,
        description: input.description,
        status: PoolStatus.ACTIVE,
        complianceRecords: {
          poolType: input.poolType,
          startDate: input.startDate.toISOString(),
          endDate: input.endDate.toISOString(),
          totalComplianceUnits: input.totalComplianceUnits ?? 0,
          allocatedComplianceUnits: input.allocatedComplianceUnits ?? 0,
          records: [],
        },
      },
    });

    return this.toDomain(pool);
  }

  async update(id: string, input: PoolUpdateInput): Promise<Pool> {
    // Get existing pool to preserve complianceRecords
    const existing = await prisma.pool.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Pool not found');
    }

    const existingRecords = typeof existing.complianceRecords === 'object' && existing.complianceRecords !== null
      ? existing.complianceRecords
      : { records: [] };

    // Update complianceRecords with new values if provided
    const updatedRecords = {
      ...existingRecords,
      ...(input.poolType !== undefined && { poolType: input.poolType }),
      ...(input.startDate !== undefined && { startDate: input.startDate.toISOString() }),
      ...(input.endDate !== undefined && { endDate: input.endDate.toISOString() }),
    };

    const pool = await prisma.pool.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status as PoolStatus }),
        ...((input.poolType !== undefined || input.startDate !== undefined || input.endDate !== undefined) && {
          complianceRecords: updatedRecords,
        }),
      },
    });

    return this.toDomain(pool);
  }

  async delete(id: string): Promise<void> {
    await prisma.pool.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.pool.count({
      where: { id },
    });

    return count > 0;
  }

  async addMember(poolId: string, shipId: string, units: number): Promise<PoolMember> {
    // Get pool to calculate contribution
    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
    });

    if (!pool) {
      throw new Error(`Pool with id ${poolId} not found`);
    }

    // Calculate total units from existing members
    const existingMembers = await prisma.poolMember.findMany({
      where: { poolId },
    });
    const totalUnits = existingMembers.reduce((sum, m) => {
      // Extract allocatedUnits from complianceRecords or use contributionPercentage
      const memberUnits = (m as any).allocatedUnits || (m.contributionPercentage / 100) * units || units;
      return sum + memberUnits;
    }, 0) + units;
    
    const contribution = totalUnits > 0 ? (units / totalUnits) * 100 : 0;

    // Use companyId as shipId for now (schema mismatch - should be fixed with migration)
    const member = await prisma.poolMember.create({
      data: {
        poolId,
        companyId: shipId, // Using shipId as companyId temporarily
        vesselIds: [shipId], // Store shipId in vesselIds array
        contributionPercentage: contribution,
      },
    });

    return this.memberToDomain(member);
  }

  async removeMember(poolId: string, shipId: string): Promise<void> {
    // Find member by poolId and shipId (in vesselIds or companyId)
    const member = await prisma.poolMember.findFirst({
      where: {
        poolId,
        OR: [
          { companyId: shipId },
          { vesselIds: { has: shipId } },
        ],
      },
    });

    if (member) {
      await prisma.poolMember.delete({
        where: {
          poolId_companyId: {
            poolId: member.poolId,
            companyId: member.companyId,
          },
        },
      });
    }
  }

  async getMembers(poolId: string): Promise<PoolMember[]> {
    const members = await prisma.poolMember.findMany({
      where: { poolId },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map(this.memberToDomain);
  }

  async allocateUnits(allocation: PoolAllocation): Promise<void> {
    // Find member by poolId and shipId (in vesselIds or companyId)
    const member = await prisma.poolMember.findFirst({
      where: {
        poolId: allocation.poolId,
        OR: [
          { companyId: allocation.shipId },
          { vesselIds: { has: allocation.shipId } },
        ],
      },
    });

    if (member) {
      // Update existing member's contribution percentage
      // Calculate new contribution based on additional units
      const currentContribution = member.contributionPercentage;
      const newContribution = currentContribution + (allocation.units / 100); // Simplified calculation
      
      await prisma.poolMember.update({
        where: {
          poolId_companyId: {
            poolId: member.poolId,
            companyId: member.companyId,
          },
        },
        data: {
          contributionPercentage: newContribution,
        },
      });
    } else {
      // Create new member if doesn't exist
      await this.addMember(allocation.poolId, allocation.shipId, allocation.units);
    }
  }

  async getTotalAllocatedUnits(poolId: string): Promise<number> {
    // Calculate total from contribution percentages (temporary until schema is fixed)
    const members = await prisma.poolMember.findMany({
      where: { poolId },
    });
    
    // Sum up contribution percentages as a proxy for units
    return members.reduce((sum, m) => sum + m.contributionPercentage, 0);
  }

  private toDomain(pool: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    complianceRecords: any;
    createdAt: Date;
    updatedAt: Date;
  }): Pool {
    // Extract poolType, startDate, endDate from complianceRecords JSON
    const records = typeof pool.complianceRecords === 'object' && pool.complianceRecords !== null
      ? pool.complianceRecords
      : {};
    
    return {
      id: pool.id,
      name: pool.name,
      description: pool.description ?? undefined,
      poolType: (records.poolType as PoolType) || PoolType.VOLUNTARY,
      status: pool.status as PoolStatus,
      startDate: records.startDate ? new Date(records.startDate) : new Date(),
      endDate: records.endDate ? new Date(records.endDate) : new Date(),
      totalComplianceUnits: records.totalComplianceUnits ?? 0,
      allocatedComplianceUnits: records.allocatedComplianceUnits ?? 0,
      createdAt: pool.createdAt,
      updatedAt: pool.updatedAt,
    };
  }

  private memberToDomain(member: {
    id: string;
    poolId: string;
    companyId: string;
    vesselIds: string[];
    contributionPercentage: number;
    joinedAt: Date;
  }): PoolMember {
    // Map schema fields to domain model (temporary until schema is fixed)
    const shipId = member.vesselIds && member.vesselIds.length > 0 ? member.vesselIds[0] : member.companyId;
    const allocatedUnits = member.contributionPercentage; // Temporary mapping
    
    return {
      id: member.id,
      poolId: member.poolId,
      shipId: shipId,
      allocatedUnits: allocatedUnits,
      contribution: member.contributionPercentage,
      joinedAt: member.joinedAt,
    };
  }
}


