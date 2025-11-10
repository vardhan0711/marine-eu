import {
  Compliance,
  ComplianceCreateInput,
  ComplianceUpdateInput,
  ComplianceMetrics,
  ComplianceStatus,
  FuelType,
} from '../../../core/domain/Compliance';
import { ComplianceRepository } from '../../../core/ports/ComplianceRepository';
import { prisma } from './prisma-client';

export class PrismaComplianceRepository implements ComplianceRepository {
  async findById(id: string): Promise<Compliance | null> {
    const compliance = await prisma.shipCompliance.findUnique({
      where: { id },
    });

    return compliance ? this.toDomain(compliance) : null;
  }

  async findAll(): Promise<Compliance[]> {
    const compliances = await prisma.shipCompliance.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return compliances.map(this.toDomain);
  }

  async findByShipId(shipId: string): Promise<Compliance[]> {
    const compliances = await prisma.shipCompliance.findMany({
      where: { vesselId: shipId }, // Map shipId to vesselId
      orderBy: { createdAt: 'desc' },
    });

    return compliances.map(this.toDomain);
  }

  async findByRouteId(routeId: string): Promise<Compliance[]> {
    // Since routeId is stored in JSON, we need to filter differently
    const allCompliances = await prisma.shipCompliance.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Filter by routeId in fuelConsumptions JSON
    const filtered = allCompliances.filter((c) => {
      const fuelConsumptions = Array.isArray(c.fuelConsumptions) 
        ? c.fuelConsumptions 
        : typeof c.fuelConsumptions === 'object' && c.fuelConsumptions !== null
        ? [c.fuelConsumptions]
        : [];
      return fuelConsumptions.some((fc: any) => fc.routeId === routeId);
    });

    return filtered.map(this.toDomain);
  }

  async findByReportingPeriod(period: string): Promise<Compliance[]> {
    const compliances = await prisma.shipCompliance.findMany({
      where: { reportingPeriod: period },
      orderBy: { createdAt: 'desc' },
    });

    return compliances.map(this.toDomain);
  }

  async findByStatus(status: ComplianceStatus): Promise<Compliance[]> {
    const compliances = await prisma.shipCompliance.findMany({
      where: { complianceStatus: status as ComplianceStatus },
      orderBy: { createdAt: 'desc' },
    });

    return compliances.map(this.toDomain);
  }

  async getMetricsByShipId(shipId: string, period?: string): Promise<ComplianceMetrics> {
    const where: { vesselId: string; reportingPeriod?: string } = { vesselId: shipId };
    if (period) {
      where.reportingPeriod = period;
    }

    const compliances = await prisma.shipCompliance.findMany({
      where,
    });

    return this.calculateMetrics(compliances);
  }

  async getMetricsByRouteId(routeId: string, period?: string): Promise<ComplianceMetrics> {
    // Since routeId is stored in JSON, we need to filter differently
    const allCompliances = await prisma.shipCompliance.findMany({
      where: period ? { reportingPeriod: period } : undefined,
    });

    // Filter by routeId in fuelConsumptions JSON
    const filtered = allCompliances.filter((c) => {
      const fuelConsumptions = Array.isArray(c.fuelConsumptions) 
        ? c.fuelConsumptions 
        : typeof c.fuelConsumptions === 'object' && c.fuelConsumptions !== null
        ? [c.fuelConsumptions]
        : [];
      return fuelConsumptions.some((fc: any) => fc.routeId === routeId);
    });

    return this.calculateMetrics(filtered);
  }

  async create(input: ComplianceCreateInput): Promise<Compliance> {
    // Check if a record already exists for this vesselId and reportingPeriod
    const existing = await prisma.shipCompliance.findUnique({
      where: {
        vesselId_reportingPeriod: {
          vesselId: input.shipId,
          reportingPeriod: input.reportingPeriod,
        },
      },
    });

    // Store individual fuel consumption record in JSON
    const fuelConsumptionRecord = {
      routeId: input.routeId,
      voyageId: input.voyageId,
      fuelType: input.fuelType,
      fuelConsumption: input.fuelConsumption,
      energyContent: input.energyContent,
      ghgIntensity: input.ghgIntensity,
      timestamp: new Date().toISOString(),
    };

    // Store compliance period info in JSON
    const compliancePeriod = {
      routeId: input.routeId,
      voyageId: input.voyageId,
      period: input.reportingPeriod,
    };

    let compliance;

    if (existing) {
      // Update existing record: append new fuel consumption and recalculate aggregates
      const existingFuelConsumptions = Array.isArray(existing.fuelConsumptions)
        ? existing.fuelConsumptions
        : typeof existing.fuelConsumptions === 'object' && existing.fuelConsumptions !== null
        ? [existing.fuelConsumptions]
        : [];
      
      const existingPeriods = Array.isArray(existing.compliancePeriods)
        ? existing.compliancePeriods
        : typeof existing.compliancePeriods === 'object' && existing.compliancePeriods !== null
        ? [existing.compliancePeriods]
        : [];

      const updatedFuelConsumptions = [...existingFuelConsumptions, fuelConsumptionRecord];
      const updatedPeriods = existingPeriods.some((p: any) => p.routeId === input.routeId && p.voyageId === input.voyageId)
        ? existingPeriods
        : [...existingPeriods, compliancePeriod];

      // Recalculate aggregated values
      const totalEnergyConsumed = updatedFuelConsumptions.reduce(
        (sum, fc: any) => sum + (fc.energyContent || 0),
        0
      );
      const totalCO2Emissions = updatedFuelConsumptions.reduce(
        (sum, fc: any) => sum + ((fc.energyContent || 0) * (fc.ghgIntensity || 0)),
        0
      );
      const averageCarbonIntensity = totalEnergyConsumed > 0
        ? totalCO2Emissions / totalEnergyConsumed
        : input.ghgIntensity;
      const targetCarbonIntensity = 89.3368;
      const complianceStatus = averageCarbonIntensity <= targetCarbonIntensity
        ? ComplianceStatus.COMPLIANT
        : ComplianceStatus.NON_COMPLIANT;

      compliance = await prisma.shipCompliance.update({
        where: { id: existing.id },
        data: {
          totalEnergyConsumed,
          totalCO2Emissions,
          averageCarbonIntensity,
          targetCarbonIntensity,
          complianceStatus,
          fuelConsumptions: updatedFuelConsumptions,
          compliancePeriods: updatedPeriods,
        },
      });
    } else {
      // Create new record
      const totalEnergyConsumed = input.energyContent;
      const totalCO2Emissions = input.energyContent * input.ghgIntensity;
      const averageCarbonIntensity = input.ghgIntensity;
      const targetCarbonIntensity = 89.3368;
      const complianceStatus = input.ghgIntensity <= targetCarbonIntensity
        ? ComplianceStatus.COMPLIANT
        : ComplianceStatus.NON_COMPLIANT;

      compliance = await prisma.shipCompliance.create({
        data: {
          vesselId: input.shipId, // Map shipId to vesselId
          reportingPeriod: input.reportingPeriod,
          totalEnergyConsumed,
          totalCO2Emissions,
          averageCarbonIntensity,
          targetCarbonIntensity,
          complianceStatus,
          fuelConsumptions: [fuelConsumptionRecord], // Store as array in JSON
          compliancePeriods: [compliancePeriod], // Store as array in JSON
        },
      });
    }

    return this.toDomain(compliance);
  }

  async update(id: string, input: ComplianceUpdateInput): Promise<Compliance> {
    const compliance = await prisma.shipCompliance.update({
      where: { id },
      data: {
        ...(input.fuelType !== undefined && { fuelType: input.fuelType as FuelType }),
        ...(input.fuelConsumption !== undefined && { fuelConsumption: input.fuelConsumption }),
        ...(input.energyContent !== undefined && { energyContent: input.energyContent }),
        ...(input.ghgIntensity !== undefined && { ghgIntensity: input.ghgIntensity }),
        ...(input.complianceStatus !== undefined && {
          complianceStatus: input.complianceStatus as ComplianceStatus,
        }),
        ...(input.reportingPeriod !== undefined && { reportingPeriod: input.reportingPeriod }),
      },
    });

    return this.toDomain(compliance);
  }

  async delete(id: string): Promise<void> {
    await prisma.shipCompliance.delete({
      where: { id },
    });
  }

  async deleteAll(): Promise<void> {
    await prisma.shipCompliance.deleteMany({});
  }

  async deleteByStatus(status: ComplianceStatus): Promise<void> {
    await prisma.shipCompliance.deleteMany({
      where: { complianceStatus: status as ComplianceStatus },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.shipCompliance.count({
      where: { id },
    });

    return count > 0;
  }

  private toDomain(compliance: {
    id: string;
    vesselId: string;
    reportingPeriod: string;
    totalEnergyConsumed: number;
    totalCO2Emissions: number;
    averageCarbonIntensity: number;
    targetCarbonIntensity: number;
    complianceStatus: string;
    fuelConsumptions: any;
    compliancePeriods: any;
    createdAt: Date;
    updatedAt: Date;
  }): Compliance {
    // Extract the first fuel consumption record from JSON
    const fuelConsumptions = Array.isArray(compliance.fuelConsumptions) 
      ? compliance.fuelConsumptions 
      : typeof compliance.fuelConsumptions === 'object' && compliance.fuelConsumptions !== null
      ? [compliance.fuelConsumptions]
      : [];
    
    const firstFuelRecord = fuelConsumptions[0] || {};
    
    // Extract route and voyage info from compliancePeriods
    const compliancePeriods = Array.isArray(compliance.compliancePeriods) 
      ? compliance.compliancePeriods 
      : typeof compliance.compliancePeriods === 'object' && compliance.compliancePeriods !== null
      ? [compliance.compliancePeriods]
      : [];
    
    const firstPeriod = compliancePeriods[0] || {};

    return {
      id: compliance.id,
      shipId: compliance.vesselId, // Map vesselId back to shipId
      routeId: firstFuelRecord.routeId || firstPeriod.routeId || '',
      voyageId: firstFuelRecord.voyageId || firstPeriod.voyageId || '',
      fuelType: (firstFuelRecord.fuelType || 'MGO') as FuelType,
      fuelConsumption: firstFuelRecord.fuelConsumption || 0,
      energyContent: firstFuelRecord.energyContent || compliance.totalEnergyConsumed,
      ghgIntensity: firstFuelRecord.ghgIntensity || compliance.averageCarbonIntensity,
      complianceStatus: compliance.complianceStatus as ComplianceStatus,
      reportingPeriod: compliance.reportingPeriod,
      createdAt: compliance.createdAt,
      updatedAt: compliance.updatedAt,
    };
  }

  private calculateMetrics(compliances: Array<{
    totalEnergyConsumed: number;
    totalCO2Emissions: number;
    averageCarbonIntensity: number;
    complianceStatus: string;
    fuelConsumptions?: any;
  }>): ComplianceMetrics {
    if (compliances.length === 0) {
      return {
        totalGhgEmissions: 0,
        averageGhgIntensity: 0,
        totalEnergyConsumed: 0,
        complianceRate: 0,
      };
    }

    const totalEnergyConsumed = compliances.reduce(
      (sum, c) => sum + c.totalEnergyConsumed,
      0
    );

    const totalGhgEmissions = compliances.reduce(
      (sum, c) => sum + c.totalCO2Emissions,
      0
    );

    const averageGhgIntensity =
      totalEnergyConsumed > 0 ? totalGhgEmissions / totalEnergyConsumed : 0;

    const compliantCount = compliances.filter(
      (c) => c.complianceStatus === ComplianceStatus.COMPLIANT
    ).length;

    const complianceRate = (compliantCount / compliances.length) * 100;

    return {
      totalGhgEmissions,
      averageGhgIntensity,
      totalEnergyConsumed,
      complianceRate,
    };
  }
}

