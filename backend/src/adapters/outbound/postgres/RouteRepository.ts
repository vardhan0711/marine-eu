import { Route, RouteCreateInput, RouteUpdateInput, RouteType } from '../../../core/domain/Route';
import { RouteRepository } from '../../../core/ports/RouteRepository';
import { prisma } from './prisma-client';

export class PrismaRouteRepository implements RouteRepository {
  async findById(id: string): Promise<Route | null> {
    const route = await prisma.routes.findUnique({
      where: { id },
    });

    return route ? this.toDomain(route) : null;
  }

  async findAll(): Promise<Route[]> {
    const routes = await prisma.routes.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return routes.map(this.toDomain);
  }

  async findByPorts(originPort: string, destinationPort: string): Promise<Route[]> {
    // Note: The actual schema uses segments JSON field, so we need to filter differently
    const routes = await prisma.routes.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Filter by origin and destination from segments
    return routes
      .filter(route => {
        const segments = typeof route.segments === 'object' && route.segments !== null 
          ? route.segments as any 
          : {};
        return segments.origin === originPort && segments.destination === destinationPort;
      })
      .map(this.toDomain);
  }

  async create(input: RouteCreateInput): Promise<Route> {
    const route = await prisma.routes.create({
      data: {
        vesselId: 'V001', // Default, should be provided in input
        name: `${input.originPort}–${input.destinationPort}`,
        totalDistanceNauticalMiles: input.distance, // Assuming input.distance is in nautical miles
        startDate: new Date(),
        status: 'PLANNED',
        segments: {
          origin: input.originPort,
          destination: input.destinationPort,
          distanceKm: input.distance * 1.852, // Convert nm to km
          routeType: input.routeType,
        },
      },
    });

    return this.toDomain(route);
  }

  async update(id: string, input: RouteUpdateInput): Promise<Route> {
    const existing = await prisma.routes.findUnique({ where: { id } });
    if (!existing) throw new Error('Route not found');

    const segments = typeof existing.segments === 'object' && existing.segments !== null 
      ? existing.segments as any 
      : {};

    const route = await prisma.routes.update({
      where: { id },
      data: {
        ...(input.originPort !== undefined || input.destinationPort !== undefined ? {
          name: `${input.originPort || segments.origin}–${input.destinationPort || segments.destination}`,
          segments: {
            ...segments,
            ...(input.originPort !== undefined && { origin: input.originPort }),
            ...(input.destinationPort !== undefined && { destination: input.destinationPort }),
            ...(input.distance !== undefined && { distanceKm: input.distance * 1.852 }),
            ...(input.routeType !== undefined && { routeType: input.routeType }),
          },
        } : {}),
        ...(input.distance !== undefined && { totalDistanceNauticalMiles: input.distance }),
      },
    });

    return this.toDomain(route);
  }

  async delete(id: string): Promise<void> {
    await prisma.routes.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.routes.count({
      where: { id },
    });

    return count > 0;
  }

  private toDomain(route: {
    id: string;
    vesselId: string;
    name: string;
    totalDistanceNauticalMiles: number;
    startDate: Date;
    endDate: Date | null;
    status: string;
    segments: any;
    createdAt: Date;
    updatedAt: Date;
  }): Route {
    const segments = typeof route.segments === 'object' && route.segments !== null 
      ? route.segments 
      : {};
    
    return {
      id: route.id,
      originPort: segments.origin || 'N/A',
      destinationPort: segments.destination || 'N/A',
      distance: route.totalDistanceNauticalMiles,
      routeType: (segments.routeType as RouteType) || 'INTRA_EU',
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
    };
  }
}

