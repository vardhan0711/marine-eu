import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from './helpers/test-app';
import { RouteType } from '../../src/core/domain/Route';

describe('Routes API', () => {
  const { app, routeRepository } = createTestApp();

  beforeEach(() => {
    routeRepository.clear();
  });

  describe('GET /routes', () => {
    it('should return empty array when no routes exist', async () => {
      const response = await request(app).get('/routes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ routes: [] });
    });

    it('should return all routes', async () => {
      const route1 = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      const route2 = await routeRepository.create({
        originPort: 'Port C',
        destinationPort: 'Port D',
        distance: 200,
        routeType: RouteType.EXTRA_EU,
      });

      const response = await request(app).get('/routes');

      expect(response.status).toBe(200);
      expect(response.body.routes).toHaveLength(2);
      expect(response.body.routes.map((r: any) => r.id)).toContain(route1.id);
      expect(response.body.routes.map((r: any) => r.id)).toContain(route2.id);
    });

    it('should filter routes by origin and destination ports', async () => {
      await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      await routeRepository.create({
        originPort: 'Port C',
        destinationPort: 'Port D',
        distance: 200,
        routeType: RouteType.EXTRA_EU,
      });

      const response = await request(app)
        .get('/routes')
        .query({ originPort: 'Port A', destinationPort: 'Port B' });

      expect(response.status).toBe(200);
      expect(response.body.routes).toHaveLength(1);
      expect(response.body.routes[0].originPort).toBe('Port A');
      expect(response.body.routes[0].destinationPort).toBe('Port B');
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/routes')
        .query({ invalidParam: 'value' });

      // Should still work, just ignore invalid params
      expect(response.status).toBe(200);
    });
  });

  describe('GET /routes/:id', () => {
    it('should return route by ID', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      const response = await request(app).get(`/routes/${route.id}`);

      expect(response.status).toBe(200);
      expect(response.body.route.id).toBe(route.id);
      expect(response.body.route.originPort).toBe('Port A');
    });

    it('should return 404 for non-existent route', async () => {
      const response = await request(app).get('/routes/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });

    it('should validate UUID format', async () => {
      const response = await request(app).get('/routes/invalid-uuid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('POST /routes', () => {
    it('should create a new route', async () => {
      const routeData = {
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: 'INTRA_EU',
      };

      const response = await request(app).post('/routes').send(routeData);

      expect(response.status).toBe(201);
      expect(response.body.route).toBeDefined();
      expect(response.body.route.originPort).toBe('Port A');
      expect(response.body.route.destinationPort).toBe('Port B');
      expect(response.body.route.distance).toBe(100);
      expect(response.body.route.routeType).toBe('INTRA_EU');
    });

    it('should reject invalid route type', async () => {
      const routeData = {
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: 'INVALID_TYPE',
      };

      const response = await request(app).post('/routes').send(routeData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject missing required fields', async () => {
      const routeData = {
        originPort: 'Port A',
        // Missing destinationPort, distance, routeType
      };

      const response = await request(app).post('/routes').send(routeData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
      expect(response.body.details.length).toBeGreaterThan(0);
    });

    it('should reject negative distance', async () => {
      const routeData = {
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: -100,
        routeType: 'INTRA_EU',
      };

      const response = await request(app).post('/routes').send(routeData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject empty origin port', async () => {
      const routeData = {
        originPort: '',
        destinationPort: 'Port B',
        distance: 100,
        routeType: 'INTRA_EU',
      };

      const response = await request(app).post('/routes').send(routeData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('PUT /routes/:id', () => {
    it('should update an existing route', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      const updateData = {
        distance: 150,
        routeType: 'EXTRA_EU',
      };

      const response = await request(app).put(`/routes/${route.id}`).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.route.distance).toBe(150);
      expect(response.body.route.routeType).toBe('EXTRA_EU');
      expect(response.body.route.originPort).toBe('Port A'); // Unchanged
    });

    it('should return 404 for non-existent route', async () => {
      const response = await request(app)
        .put('/routes/non-existent-id')
        .send({ distance: 150 });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });

    it('should validate UUID format', async () => {
      const response = await request(app).put('/routes/invalid-uuid').send({ distance: 150 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject invalid update data', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      const response = await request(app)
        .put(`/routes/${route.id}`)
        .send({ distance: -100 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('DELETE /routes/:id', () => {
    it('should delete an existing route', async () => {
      const route = await routeRepository.create({
        originPort: 'Port A',
        destinationPort: 'Port B',
        distance: 100,
        routeType: RouteType.INTRA_EU,
      });

      const response = await request(app).delete(`/routes/${route.id}`);

      expect(response.status).toBe(204);
      expect(await routeRepository.exists(route.id)).toBe(false);
    });

    it('should return 404 for non-existent route', async () => {
      const response = await request(app).delete('/routes/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });

    it('should validate UUID format', async () => {
      const response = await request(app).delete('/routes/invalid-uuid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });
});

