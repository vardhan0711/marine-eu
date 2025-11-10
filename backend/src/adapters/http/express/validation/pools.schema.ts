import { z } from 'zod';

export const PoolTypeEnum = z.enum(['VOLUNTARY', 'MANDATORY', 'COMPANY', 'FLEET']);
export const PoolStatusEnum = z.enum(['ACTIVE', 'CLOSED', 'PENDING', 'SUSPENDED']);

export const createPoolSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Pool name is required'),
    description: z.string().optional(),
    poolType: PoolTypeEnum,
    startDate: z.string().datetime().or(z.date()),
    endDate: z.string().datetime().or(z.date()),
    totalComplianceUnits: z.number().nonnegative('Total units must be non-negative').optional(),
    allocatedComplianceUnits: z.number().nonnegative('Allocated units must be non-negative').optional(),
  }).refine((data) => {
    const start = typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate;
    const end = typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate;
    return start < end;
  }, {
    message: 'Start date must be before end date',
    path: ['endDate'],
  }).refine((data) => {
    if (data.allocatedComplianceUnits !== undefined && data.totalComplianceUnits !== undefined) {
      return data.allocatedComplianceUnits <= data.totalComplianceUnits;
    }
    return true;
  }, {
    message: 'Allocated units cannot exceed total units',
    path: ['allocatedComplianceUnits'],
  }),
});

export const updatePoolSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid pool ID'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    poolType: PoolTypeEnum.optional(),
    status: PoolStatusEnum.optional(),
    startDate: z.string().datetime().or(z.date()).optional(),
    endDate: z.string().datetime().or(z.date()).optional(),
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      const start = typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate;
      const end = typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate;
      return start < end;
    }
    return true;
  }, {
    message: 'Start date must be before end date',
    path: ['endDate'],
  }),
});

export const poolParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid pool ID'),
  }),
});

export const poolQuerySchema = z.object({
  query: z.object({
    status: PoolStatusEnum.optional(),
    poolType: PoolTypeEnum.optional(),
    shipId: z.string().optional(),
  }),
});

export const addPoolMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid pool ID'),
  }),
  body: z.object({
    shipId: z.string().min(1, 'Ship ID is required'),
    units: z.number().positive('Units must be positive'),
  }),
});

export const removePoolMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid pool ID'),
    shipId: z.string().min(1, 'Ship ID is required'),
  }),
});

export const allocateUnitsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid pool ID'),
  }),
  body: z.object({
    shipId: z.string().min(1, 'Ship ID is required'),
    units: z.number().positive('Units must be positive'),
  }),
});

