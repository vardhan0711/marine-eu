import { Route, RouteCreateInput, RouteUpdateInput } from '../domain/Route';

export interface RouteRepository {
  findById(id: string): Promise<Route | null>;
  findAll(): Promise<Route[]>;
  findByPorts(originPort: string, destinationPort: string): Promise<Route[]>;
  create(input: RouteCreateInput): Promise<Route>;
  update(id: string, input: RouteUpdateInput): Promise<Route>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

