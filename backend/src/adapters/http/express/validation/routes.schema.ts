import { z } from 'zod';

export const RouteTypeEnum = z.enum(['INTRA_EU', 'EXTRA_EU', 'MIXED']);

export const createRouteSchema = z.object({
  body: z.object({
    originPort: z.string().min(1, 'Origin port is required'),
    destinationPort: z.string().min(1, 'Destination port is required'),
    distance: z.number().positive('Distance must be positive'),
    routeType: RouteTypeEnum,
  }),
});

export const updateRouteSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid route ID'),
  }),
  body: z.object({
    originPort: z.string().min(1).optional(),
    destinationPort: z.string().min(1).optional(),
    distance: z.number().positive().optional(),
    routeType: RouteTypeEnum.optional(),
  }),
});

export const routeParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid route ID'),
  }),
});

export const routeQuerySchema = z.object({
  query: z.object({
    originPort: z.string().optional(),
    destinationPort: z.string().optional(),
  }),
});

