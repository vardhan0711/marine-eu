export interface Route {
  id: string;
  originPort: string;
  destinationPort: string;
  distance: number; // in nautical miles
  routeType: RouteType;
  createdAt: Date;
  updatedAt: Date;
}

export enum RouteType {
  INTRA_EU = 'INTRA_EU',
  EXTRA_EU = 'EXTRA_EU',
  MIXED = 'MIXED',
}

export interface RouteCreateInput {
  originPort: string;
  destinationPort: string;
  distance: number;
  routeType: RouteType;
}

export interface RouteUpdateInput {
  originPort?: string;
  destinationPort?: string;
  distance?: number;
  routeType?: RouteType;
}

