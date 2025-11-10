import { z } from 'zod';

export const FuelTypeEnum = z.enum([
  'MGO',
  'MDO',
  'HFO',
  'LNG',
  'LPG',
  'METHANOL',
  'ETHANOL',
  'HYDROGEN',
  'AMMONIA',
  'ELECTRICITY',
  'BIOFUEL',
  'SYNTHETIC_FUEL',
]);

export const ComplianceStatusEnum = z.enum([
  'COMPLIANT',
  'NON_COMPLIANT',
  'PENDING',
  'UNDER_REVIEW',
]);

export const createComplianceSchema = z.object({
  body: z.object({
    shipId: z.string().min(1, 'Ship ID is required'),
    routeId: z.string().uuid('Invalid route ID'),
    voyageId: z.string().min(1, 'Voyage ID is required'),
    fuelType: FuelTypeEnum,
    fuelConsumption: z.number().positive('Fuel consumption must be positive'),
    energyContent: z.number().positive('Energy content must be positive'),
    ghgIntensity: z.number().nonnegative('GHG intensity must be non-negative'),
    reportingPeriod: z.string().regex(/^\d{4}-\d{2}$/, 'Reporting period must be in YYYY-MM format'),
  }),
});

export const updateComplianceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid compliance ID'),
  }),
  body: z.object({
    fuelType: FuelTypeEnum.optional(),
    fuelConsumption: z.number().positive().optional(),
    energyContent: z.number().positive().optional(),
    ghgIntensity: z.number().nonnegative().optional(),
    complianceStatus: ComplianceStatusEnum.optional(),
    reportingPeriod: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  }),
});

export const complianceParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid compliance ID'),
  }),
});

export const complianceQuerySchema = z.object({
  query: z.object({
    shipId: z.string().optional(),
    routeId: z.string().uuid().optional(),
    reportingPeriod: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    status: ComplianceStatusEnum.optional(),
  }),
});

export const computeCBSchema = z.object({
  body: z.object({
    actualGhgIntensity: z.number().nonnegative('GHG intensity must be non-negative'),
    fuelConsumption: z.number().positive('Fuel consumption must be positive'),
  }),
});

export const computeComparisonSchema = z.object({
  body: z.object({
    actualGhgIntensity: z.number().nonnegative('GHG intensity must be non-negative'),
  }),
});

