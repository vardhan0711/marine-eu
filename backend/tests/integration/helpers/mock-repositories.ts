import { Route, RouteCreateInput, RouteUpdateInput } from '../../../src/core/domain/Route';
import { Compliance, ComplianceCreateInput, ComplianceUpdateInput, ComplianceMetrics, ComplianceStatus } from '../../../src/core/domain/Compliance';
import { Pool, PoolCreateInput, PoolUpdateInput, PoolMember, PoolAllocation, PoolStatus } from '../../../src/core/domain/Pool';
import { RouteRepository } from '../../../src/core/ports/RouteRepository';
import { ComplianceRepository } from '../../../src/core/ports/ComplianceRepository';
import { PoolRepository } from '../../../src/core/ports/PoolRepository';

export class MockRouteRepository implements RouteRepository {
  private routes: Map<string, Route> = new Map();

  async findById(id: string): Promise<Route | null> {
    return this.routes.get(id) || null;
  }

  async findAll(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async findByPorts(originPort: string, destinationPort: string): Promise<Route[]> {
    return Array.from(this.routes.values()).filter(
      (r) => r.originPort === originPort && r.destinationPort === destinationPort
    );
  }

  async create(input: RouteCreateInput): Promise<Route> {
    const route: Route = {
      id: `route-${Date.now()}`,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.routes.set(route.id, route);
    return route;
  }

  async update(id: string, input: RouteUpdateInput): Promise<Route> {
    const route = this.routes.get(id);
    if (!route) throw new Error('Route not found');
    const updated: Route = {
      ...route,
      ...input,
      updatedAt: new Date(),
    };
    this.routes.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.routes.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.routes.has(id);
  }

  clear(): void {
    this.routes.clear();
  }
}

export class MockComplianceRepository implements ComplianceRepository {
  private compliances: Map<string, Compliance> = new Map();

  async findById(id: string): Promise<Compliance | null> {
    return this.compliances.get(id) || null;
  }

  async findAll(): Promise<Compliance[]> {
    return Array.from(this.compliances.values());
  }

  async findByShipId(shipId: string): Promise<Compliance[]> {
    return Array.from(this.compliances.values()).filter((c) => c.shipId === shipId);
  }

  async findByRouteId(routeId: string): Promise<Compliance[]> {
    return Array.from(this.compliances.values()).filter((c) => c.routeId === routeId);
  }

  async findByReportingPeriod(period: string): Promise<Compliance[]> {
    return Array.from(this.compliances.values()).filter((c) => c.reportingPeriod === period);
  }

  async findByStatus(status: ComplianceStatus): Promise<Compliance[]> {
    return Array.from(this.compliances.values()).filter((c) => c.complianceStatus === status);
  }

  async getMetricsByShipId(shipId: string, period?: string): Promise<ComplianceMetrics> {
    let compliances = this.findByShipId(shipId);
    if (period) {
      const byPeriod = await this.findByReportingPeriod(period);
      compliances = (await compliances).filter((c) => byPeriod.includes(c));
    }

    const items = await compliances;
    if (items.length === 0) {
      return {
        totalGhgEmissions: 0,
        averageGhgIntensity: 0,
        totalEnergyConsumed: 0,
        complianceRate: 0,
      };
    }

    const totalEnergy = items.reduce((sum, c) => sum + c.energyContent, 0);
    const totalEmissions = items.reduce((sum, c) => sum + c.energyContent * c.ghgIntensity, 0);
    const avgIntensity = totalEnergy > 0 ? totalEmissions / totalEnergy : 0;
    const compliantCount = items.filter((c) => c.complianceStatus === ComplianceStatus.COMPLIANT).length;
    const complianceRate = (compliantCount / items.length) * 100;

    return {
      totalGhgEmissions: totalEmissions,
      averageGhgIntensity: avgIntensity,
      totalEnergyConsumed: totalEnergy,
      complianceRate,
    };
  }

  async getMetricsByRouteId(routeId: string, period?: string): Promise<ComplianceMetrics> {
    let compliances = this.findByRouteId(routeId);
    if (period) {
      const byPeriod = await this.findByReportingPeriod(period);
      compliances = (await compliances).filter((c) => byPeriod.includes(c));
    }

    const items = await compliances;
    if (items.length === 0) {
      return {
        totalGhgEmissions: 0,
        averageGhgIntensity: 0,
        totalEnergyConsumed: 0,
        complianceRate: 0,
      };
    }

    const totalEnergy = items.reduce((sum, c) => sum + c.energyContent, 0);
    const totalEmissions = items.reduce((sum, c) => sum + c.energyContent * c.ghgIntensity, 0);
    const avgIntensity = totalEnergy > 0 ? totalEmissions / totalEnergy : 0;
    const compliantCount = items.filter((c) => c.complianceStatus === ComplianceStatus.COMPLIANT).length;
    const complianceRate = (compliantCount / items.length) * 100;

    return {
      totalGhgEmissions: totalEmissions,
      averageGhgIntensity: avgIntensity,
      totalEnergyConsumed: totalEnergy,
      complianceRate,
    };
  }

  async create(input: ComplianceCreateInput): Promise<Compliance> {
    const compliance: Compliance = {
      id: `compliance-${Date.now()}`,
      ...input,
      complianceStatus: ComplianceStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.compliances.set(compliance.id, compliance);
    return compliance;
  }

  async update(id: string, input: ComplianceUpdateInput): Promise<Compliance> {
    const compliance = this.compliances.get(id);
    if (!compliance) throw new Error('Compliance not found');
    const updated: Compliance = {
      ...compliance,
      ...input,
      updatedAt: new Date(),
    };
    this.compliances.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.compliances.delete(id);
  }

  async deleteAll(): Promise<void> {
    this.compliances.clear();
  }

  async exists(id: string): Promise<boolean> {
    return this.compliances.has(id);
  }

  clear(): void {
    this.compliances.clear();
  }
}

export class MockPoolRepository implements PoolRepository {
  private pools: Map<string, Pool> = new Map();
  private members: Map<string, PoolMember> = new Map();

  async findById(id: string): Promise<Pool | null> {
    return this.pools.get(id) || null;
  }

  async findAll(): Promise<Pool[]> {
    return Array.from(this.pools.values());
  }

  async findByStatus(status: PoolStatus): Promise<Pool[]> {
    return Array.from(this.pools.values()).filter((p) => p.status === status);
  }

  async findByShipId(shipId: string): Promise<Pool[]> {
    const memberPools = Array.from(this.members.values())
      .filter((m) => m.shipId === shipId)
      .map((m) => this.pools.get(m.poolId))
      .filter((p): p is Pool => p !== undefined);
    return memberPools;
  }

  async findActivePools(): Promise<Pool[]> {
    return Array.from(this.pools.values()).filter((p) => p.status === PoolStatus.ACTIVE);
  }

  async create(input: PoolCreateInput): Promise<Pool> {
    const pool: Pool = {
      id: `pool-${Date.now()}`,
      ...input,
      status: PoolStatus.PENDING,
      totalComplianceUnits: 0,
      allocatedComplianceUnits: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.pools.set(pool.id, pool);
    return pool;
  }

  async update(id: string, input: PoolUpdateInput): Promise<Pool> {
    const pool = this.pools.get(id);
    if (!pool) throw new Error('Pool not found');
    const updated: Pool = {
      ...pool,
      ...input,
      updatedAt: new Date(),
    };
    this.pools.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.pools.delete(id);
    // Delete members
    Array.from(this.members.values())
      .filter((m) => m.poolId === id)
      .forEach((m) => this.members.delete(m.id));
  }

  async exists(id: string): Promise<boolean> {
    return this.pools.has(id);
  }

  async addMember(poolId: string, shipId: string, units: number): Promise<PoolMember> {
    const pool = this.pools.get(poolId);
    if (!pool) throw new Error('Pool not found');

    const totalUnits = pool.totalComplianceUnits || 1;
    const contribution = (units / totalUnits) * 100;

    const member: PoolMember = {
      id: `member-${Date.now()}`,
      poolId,
      shipId,
      allocatedUnits: units,
      contribution,
      joinedAt: new Date(),
    };

    this.members.set(member.id, member);

    const updatedPool: Pool = {
      ...pool,
      allocatedComplianceUnits: pool.allocatedComplianceUnits + units,
      updatedAt: new Date(),
    };
    this.pools.set(poolId, updatedPool);

    return member;
  }

  async removeMember(poolId: string, shipId: string): Promise<void> {
    const member = Array.from(this.members.values()).find(
      (m) => m.poolId === poolId && m.shipId === shipId
    );

    if (member) {
      const pool = this.pools.get(poolId);
      if (pool) {
        const updatedPool: Pool = {
          ...pool,
          allocatedComplianceUnits: pool.allocatedComplianceUnits - member.allocatedUnits,
          updatedAt: new Date(),
        };
        this.pools.set(poolId, updatedPool);
      }
      this.members.delete(member.id);
    }
  }

  async getMembers(poolId: string): Promise<PoolMember[]> {
    return Array.from(this.members.values()).filter((m) => m.poolId === poolId);
  }

  async allocateUnits(allocation: PoolAllocation): Promise<void> {
    const member = Array.from(this.members.values()).find(
      (m) => m.poolId === allocation.poolId && m.shipId === allocation.shipId
    );

    if (member) {
      const updatedMember: PoolMember = {
        ...member,
        allocatedUnits: member.allocatedUnits + allocation.units,
      };
      this.members.set(member.id, updatedMember);

      const pool = this.pools.get(allocation.poolId);
      if (pool) {
        const updatedPool: Pool = {
          ...pool,
          allocatedComplianceUnits: pool.allocatedComplianceUnits + allocation.units,
          updatedAt: new Date(),
        };
        this.pools.set(allocation.poolId, updatedPool);
      }
    } else {
      await this.addMember(allocation.poolId, allocation.shipId, allocation.units);
    }
  }

  async getTotalAllocatedUnits(poolId: string): Promise<number> {
    return Array.from(this.members.values())
      .filter((m) => m.poolId === poolId)
      .reduce((sum, m) => sum + m.allocatedUnits, 0);
  }

  clear(): void {
    this.pools.clear();
    this.members.clear();
  }
}

