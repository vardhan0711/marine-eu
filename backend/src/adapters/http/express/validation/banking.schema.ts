import { z } from 'zod';

export const bankSurplusSchema = z.object({
  body: z.object({
    surplusUnits: z.number().positive('Surplus units must be positive'),
    bankingDate: z.string().datetime().or(z.date()),
    maxBankingCapacity: z.number().positive().optional(),
    bankingValidityYears: z.number().int().positive().max(10).optional(),
    shipId: z.string().optional(),
    reportingPeriod: z.string().optional(),
  }),
});

export const applyBankedSchema = z.object({
  body: z.object({
    deficit: z.number().positive('Deficit must be positive'),
    applicationDate: z.string().datetime().or(z.date()),
    availableBankedUnits: z.array(
      z.object({
        id: z.string().uuid('Invalid banked unit ID'),
        units: z.number().positive('Units must be positive'),
        bankedAt: z.string().datetime().or(z.date()),
        expiryDate: z.string().datetime().or(z.date()),
      })
    ),
  }),
});

export const bankingQuerySchema = z.object({
  query: z.object({
    shipId: z.string().optional(),
    expired: z.string().transform((val) => val === 'true').optional(),
  }),
});

