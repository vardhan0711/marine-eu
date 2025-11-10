import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from './helpers/test-app';
import { FuelType, ComplianceStatus } from '../../src/core/domain/Compliance';
import { RouteType } from '../../src/core/domain/Route';

describe('Compliance API', () => {
  const { app, complianceRepository, routeRepository } = createTestApp();

  beforeEach(() => {
    complianceRepository.clear();
    routeRepository.clear();
  });

  describe('GET /compliance', () => {
    it('should return empty array when no compliance records exist', async () => {
      const response = await request(app).get('/compliance');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ compliances: [] });
    });

    it('should return all compliance records', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      const compliance1 = await complianceRepository.create({
        shipId: 'ship-1',
        routeId: route.id,
        voyageId: 'voyage-1',
        fuelType: FuelType.LNG,
        fuelConsumption: 100,
        energyContent: 5000,
        ghgIntensity: 80,
        reportingPeriod: '2024-01',
      });

      const response = await request(app).get('/compliance');

      expect(response.status).toBe(200);
      expect(response.body.compliances).toHaveLength(1);
      expect(response.body.compliances[0].id).toBe(compliance1.id);
    });

    it('should filter by shipId', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      await complianceRepository.create({
        shipId: 'ship-1',
        routeId: route.id,
        voyageId: 'voyage-1',
        fuelType: FuelType.LNG,
        fuelConsumption: 100,
        energyContent: 5000,
        ghgIntensity: 80,
        reportingPeriod: '2024-01',
      });

      await complianceRepository.create({
        shipId: 'ship-2',
        routeId: route.id,
        voyageId: 'voyage-2',
        fuelType: FuelType.MGO,
        fuelConsumption: 150,
        energyContent: 6000,
        ghgIntensity: 90,
        reportingPeriod: '2024-01',
      });

      const response = await request(app).get('/compliance').query({ shipId: 'ship-1' });

      expect(response.status).toBe(200);
      expect(response.body.compliances).toHaveLength(1);
      expect(response.body.compliances[0].shipId).toBe('ship-1');
    });

    it('should filter by reportingPeriod', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      await complianceRepository.create({
        shipId: 'ship-1',
        routeId: route.id,
        voyageId: 'voyage-1',
        fuelType: FuelType.LNG,
        fuelConsumption: 100,
        energyContent: 5000,
        ghgIntensity: 80,
        reportingPeriod: '2024-01',
      });

      await complianceRepository.create({
        shipId: 'ship-1',
        routeId: route.id,
        voyageId: 'voyage-2',
        fuelType: FuelType.MGO,
        fuelConsumption: 150,
        energyContent: 6000,
        ghgIntensity: 90,
        reportingPeriod: '2024-02',
      });

      const response = await request(app).get('/compliance').query({ reportingPeriod: '2024-01' });

      expect(response.status).toBe(200);
      expect(response.body.compliances).toHaveLength(1);
      expect(response.body.compliances[0].reportingPeriod).toBe('2024-01');
    });

    it('should validate reportingPeriod format', async () => {
      const response = await request(app).get('/compliance').query({ reportingPeriod: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('GET /compliance/:id', () => {
    it('should return compliance by ID', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      const compliance = await complianceRepository.create({
        shipId: 'ship-1',
        routeId: route.id,
        voyageId: 'voyage-1',
        fuelType: FuelType.LNG,
        fuelConsumption: 100,
        energyContent: 5000,
        ghgIntensity: 80,
        reportingPeriod: '2024-01',
      });

      const response = await request(app).get(`/compliance/${compliance.id}`);

      expect(response.status).toBe(200);
      expect(response.body.compliance.id).toBe(compliance.id);
    });

    it('should return 404 for non-existent compliance', async () => {
      const response = await request(app).get('/compliance/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Compliance record not found');
    });
  });

  describe('POST /compliance', () => {
    it('should create a new compliance record', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      const complianceData = {
        shipId: 'ship-1',
        routeId: route.id,
        voyageId: 'voyage-1',
        fuelType: 'LNG',
        fuelConsumption: 100,
        energyContent: 5000,
        ghgIntensity: 80,
        reportingPeriod: '2024-01',
      };

      const response = await request(app).post('/compliance').send(complianceData);

      expect(response.status).toBe(201);
      expect(response.body.compliance).toBeDefined();
      expect(response.body.compliance.shipId).toBe('ship-1');
      expect(response.body.compliance.fuelType).toBe('LNG');
    });

    it('should reject invalid fuel type', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      const complianceData = {
        shipId: 'ship-1',
        routeId: route.id,
        voyageId: 'voyage-1',
        fuelType: 'INVALID_FUEL',
        fuelConsumption: 100,
        energyContent: 5000,
        ghgIntensity: 80,
        reportingPeriod: '2024-01',
      };

      const response = await request(app).post('/compliance').send(complianceData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject invalid routeId format', async () => {
      const complianceData = {
        shipId: 'ship-1',
        routeId: 'invalid-uuid',
        voyageId: 'voyage-1',
        fuelType: 'LNG',
        fuelConsumption: 100,
        energyContent: 5000,
        ghgIntensity: 80,
        reportingPeriod: '2024-01',
      };

      const response = await request(app).post('/compliance').send(complianceData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject invalid reportingPeriod format', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      const complianceData = {
        shipId: 'ship-1',
        routeId: route.id,
        voyageId: 'voyage-1',
        fuelType: 'LNG',
        fuelConsumption: 100,
        energyContent: 5000,
        ghgIntensity: 80,
        reportingPeriod: '2024/01', // Invalid format
      };

      const response = await request(app).post('/compliance').send(complianceData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject negative fuel consumption', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      const complianceData = {
        shipId: 'ship-1',
        routeId: route.id,
        voyageId: 'voyage-1',
        fuelType: 'LNG',
        fuelConsumption: -100,
        energyContent: 5000,
        ghgIntensity: 80,
        reportingPeriod: '2024-01',
      };

      const response = await request(app).post('/compliance').send(complianceData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject missing required fields', async () => {
      const complianceData = {
        shipId: 'ship-1',
        // Missing other required fields
      };

      const response = await request(app).post('/compliance').send(complianceData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
      expect(response.body.details.length).toBeGreaterThan(0);
    });
  });

  describe('POST /compliance/compute-cb', () => {
    it('should compute Compliance Balance', async () => {
      const response = await request(app)
        .post('/compliance/compute-cb')
        .send({
          actualGhgIntensity: 80,
          fuelConsumption: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.cb).toBeDefined();
      expect(response.body.result.isSurplus).toBe(true); // 89.3368 - 80 = positive
    });

    it('should compute negative CB for high intensity', async () => {
      const response = await request(app)
        .post('/compliance/compute-cb')
        .send({
          actualGhgIntensity: 100,
          fuelConsumption: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body.result.isSurplus).toBe(false);
    });

    it('should reject invalid input', async () => {
      const response = await request(app)
        .post('/compliance/compute-cb')
        .send({
          actualGhgIntensity: -10, // Invalid
          fuelConsumption: 100,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('POST /compliance/compute-comparison', () => {
    it('should compute comparison', async () => {
      const response = await request(app)
        .post('/compliance/compute-comparison')
        .send({
          actualGhgIntensity: 80,
        });

      expect(response.status).toBe(200);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.isCompliant).toBe(true);
    });

    it('should reject invalid input', async () => {
      const response = await request(app)
        .post('/compliance/compute-comparison')
        .send({
          actualGhgIntensity: -10, // Invalid
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('PUT /compliance/:id', () => {
    it('should update compliance record', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      const compliance = await complianceRepository.create({
        shipId: 'ship-1',
        routeId: route.id,
        voyageId: 'voyage-1',
        fuelType: FuelType.LNG,
        fuelConsumption: 100,
        energyContent: 5000,
        ghgIntensity: 80,
        reportingPeriod: '2024-01',
      });

      const response = await request(app)
        .put(`/compliance/${compliance.id}`)
        .send({
          complianceStatus: 'COMPLIANT',
          ghgIntensity: 85,
        });

      expect(response.status).toBe(200);
      expect(response.body.compliance.complianceStatus).toBe('COMPLIANT');
      expect(response.body.compliance.ghgIntensity).toBe(85);
    });

    it('should return 404 for non-existent compliance', async () => {
      const response = await request(app)
        .put('/compliance/non-existent-id')
        .send({ complianceStatus: 'COMPLIANT' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Compliance record not found');
    });
  });

  describe('DELETE /compliance/:id', () => {
    it('should delete compliance record', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      const compliance = await complianceRepository.create({
        shipId: 'ship-1',
        routeId: route.id,
        voyageId: 'voyage-1',
        fuelType: FuelType.LNG,
        fuelConsumption: 100,
        energyContent: 5000,
        ghgIntensity: 80,
        reportingPeriod: '2024-01',
      });

      const response = await request(app).delete(`/compliance/${compliance.id}`);

      expect(response.status).toBe(204);
      const exists = await complianceRepository.exists(compliance.id);
      expect(exists).toBe(false);
    });

    it('should return 404 for non-existent compliance', async () => {
      const response = await request(app).delete('/compliance/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Compliance record not found');
    });
  });
});

