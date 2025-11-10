import {
  Compliance,
  ComplianceCreateInput,
  ComplianceUpdateInput,
  ComplianceMetrics,
  ComplianceStatus,
} from '../domain/Compliance';

export interface ComplianceRepository {
  findById(id: string): Promise<Compliance | null>;
  findAll(): Promise<Compliance[]>;
  findByShipId(shipId: string): Promise<Compliance[]>;
  findByRouteId(routeId: string): Promise<Compliance[]>;
  findByReportingPeriod(period: string): Promise<Compliance[]>;
  findByStatus(status: ComplianceStatus): Promise<Compliance[]>;
  getMetricsByShipId(shipId: string, period?: string): Promise<ComplianceMetrics>;
  getMetricsByRouteId(routeId: string, period?: string): Promise<ComplianceMetrics>;
  create(input: ComplianceCreateInput): Promise<Compliance>;
  update(id: string, input: ComplianceUpdateInput): Promise<Compliance>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;
  deleteByStatus(status: ComplianceStatus): Promise<void>;
  exists(id: string): Promise<boolean>;
}

