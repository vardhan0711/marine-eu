import { Express } from 'express';
import { createApp } from '../../../src/adapters/http/express/app';
import { MockRouteRepository } from './mock-repositories';
import { MockComplianceRepository } from './mock-repositories';
import { MockPoolRepository } from './mock-repositories';

export function createTestApp(): {
  app: Express;
  routeRepository: MockRouteRepository;
  complianceRepository: MockComplianceRepository;
  poolRepository: MockPoolRepository;
} {
  const routeRepository = new MockRouteRepository();
  const complianceRepository = new MockComplianceRepository();
  const poolRepository = new MockPoolRepository();

  const app = createApp(routeRepository, complianceRepository, poolRepository);

  return {
    app,
    routeRepository,
    complianceRepository,
    poolRepository,
  };
}

