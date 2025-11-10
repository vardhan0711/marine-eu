export interface Compliance {
  id: string;
  shipId: string;
  routeId: string;
  voyageId: string;
  fuelType: FuelType;
  fuelConsumption: number; // in metric tons
  energyContent: number; // in MJ
  ghgIntensity: number; // in gCO2eq/MJ
  complianceStatus: ComplianceStatus;
  reportingPeriod: string; // YYYY-MM format
  createdAt: Date;
  updatedAt: Date;
}

export enum FuelType {
  MGO = 'MGO', // Marine Gas Oil
  MDO = 'MDO', // Marine Diesel Oil
  HFO = 'HFO', // Heavy Fuel Oil
  LNG = 'LNG', // Liquefied Natural Gas
  LPG = 'LPG', // Liquefied Petroleum Gas
  METHANOL = 'METHANOL',
  ETHANOL = 'ETHANOL',
  HYDROGEN = 'HYDROGEN',
  AMMONIA = 'AMMONIA',
  ELECTRICITY = 'ELECTRICITY',
  BIOFUEL = 'BIOFUEL',
  SYNTHETIC_FUEL = 'SYNTHETIC_FUEL',
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export interface ComplianceCreateInput {
  shipId: string;
  routeId: string;
  voyageId: string;
  fuelType: FuelType;
  fuelConsumption: number;
  energyContent: number;
  ghgIntensity: number;
  reportingPeriod: string;
}

export interface ComplianceUpdateInput {
  fuelType?: FuelType;
  fuelConsumption?: number;
  energyContent?: number;
  ghgIntensity?: number;
  complianceStatus?: ComplianceStatus;
  reportingPeriod?: string;
}

export interface ComplianceMetrics {
  totalGhgEmissions: number; // in gCO2eq
  averageGhgIntensity: number; // in gCO2eq/MJ
  totalEnergyConsumed: number; // in MJ
  complianceRate: number; // percentage
}

