import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from './helpers/test-app';
import { PoolType, PoolStatus } from '../../src/core/domain/Pool';

describe('Pools API', () => {
  const { app, poolRepository } = createTestApp();

  beforeEach(() => {
    poolRepository.clear();
  });

  describe('GET /pools', () => {
    it('should return empty array when no pools exist', async () => {
      const response = await request(app).get('/pools');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ pools: [] });
    });

    it('should return all pools', async () => {
      const pool1 = await poolRepository.create({
        name: 'Pool 1',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      const pool2 = await poolRepository.create({
        name: 'Pool 2',
        poolType: PoolType.MANDATORY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      const response = await request(app).get('/pools');

      expect(response.status).toBe(200);
      expect(response.body.pools.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by status', async () => {
      await poolRepository.create({
        name: 'Active Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      const pool = await poolRepository.create({
        name: 'Pending Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      await poolRepository.update(pool.id, { status: PoolStatus.ACTIVE });

      const response = await request(app).get('/pools').query({ status: 'ACTIVE' });

      expect(response.status).toBe(200);
      expect(response.body.pools.every((p: any) => p.status === 'ACTIVE')).toBe(true);
    });
  });

  describe('GET /pools/:id', () => {
    it('should return pool by ID', async () => {
      const pool = await poolRepository.create({
        name: 'Test Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      const response = await request(app).get(`/pools/${pool.id}`);

      expect(response.status).toBe(200);
      expect(response.body.pool.id).toBe(pool.id);
      expect(response.body.pool.name).toBe('Test Pool');
    });

    it('should return 404 for non-existent pool', async () => {
      const response = await request(app).get('/pools/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Pool not found');
    });

    it('should validate UUID format', async () => {
      const response = await request(app).get('/pools/invalid-uuid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('POST /pools', () => {
    it('should create a new pool', async () => {
      const poolData = {
        name: 'New Pool',
        description: 'Test description',
        poolType: 'VOLUNTARY',
        startDate: new Date('2024-01-01').toISOString(),
        endDate: new Date('2024-12-31').toISOString(),
      };

      const response = await request(app).post('/pools').send(poolData);

      expect(response.status).toBe(201);
      expect(response.body.pool).toBeDefined();
      expect(response.body.pool.name).toBe('New Pool');
      expect(response.body.pool.poolType).toBe('VOLUNTARY');
      expect(response.body.pool.status).toBe('PENDING');
    });

    it('should reject invalid pool type', async () => {
      const poolData = {
        name: 'New Pool',
        poolType: 'INVALID_TYPE',
        startDate: new Date('2024-01-01').toISOString(),
        endDate: new Date('2024-12-31').toISOString(),
      };

      const response = await request(app).post('/pools').send(poolData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject when start date is after end date', async () => {
      const poolData = {
        name: 'New Pool',
        poolType: 'VOLUNTARY',
        startDate: new Date('2024-12-31').toISOString(),
        endDate: new Date('2024-01-01').toISOString(),
      };

      const response = await request(app).post('/pools').send(poolData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject empty pool name', async () => {
      const poolData = {
        name: '',
        poolType: 'VOLUNTARY',
        startDate: new Date('2024-01-01').toISOString(),
        endDate: new Date('2024-12-31').toISOString(),
      };

      const response = await request(app).post('/pools').send(poolData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject missing required fields', async () => {
      const poolData = {
        name: 'New Pool',
        // Missing other required fields
      };

      const response = await request(app).post('/pools').send(poolData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('PUT /pools/:id', () => {
    it('should update an existing pool', async () => {
      const pool = await poolRepository.create({
        name: 'Original Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      const response = await request(app)
        .put(`/pools/${pool.id}`)
        .send({
          name: 'Updated Pool',
          status: 'ACTIVE',
        });

      expect(response.status).toBe(200);
      expect(response.body.pool.name).toBe('Updated Pool');
      expect(response.body.pool.status).toBe('ACTIVE');
    });

    it('should return 404 for non-existent pool', async () => {
      const response = await request(app)
        .put('/pools/non-existent-id')
        .send({ name: 'Updated Pool' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Pool not found');
    });

    it('should reject invalid update data', async () => {
      const pool = await poolRepository.create({
        name: 'Original Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      const response = await request(app)
        .put(`/pools/${pool.id}`)
        .send({
          startDate: new Date('2024-12-31').toISOString(),
          endDate: new Date('2024-01-01').toISOString(), // Invalid
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('DELETE /pools/:id', () => {
    it('should delete an existing pool', async () => {
      const pool = await poolRepository.create({
        name: 'Pool to Delete',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      const response = await request(app).delete(`/pools/${pool.id}`);

      expect(response.status).toBe(204);
      expect(await poolRepository.exists(pool.id)).toBe(false);
    });

    it('should return 404 for non-existent pool', async () => {
      const response = await request(app).delete('/pools/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Pool not found');
    });
  });

  describe('GET /pools/:id/members', () => {
    it('should return pool members', async () => {
      const pool = await poolRepository.create({
        name: 'Pool with Members',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      await poolRepository.addMember(pool.id, 'ship-1', 100);
      await poolRepository.addMember(pool.id, 'ship-2', 200);

      const response = await request(app).get(`/pools/${pool.id}/members`);

      expect(response.status).toBe(200);
      expect(response.body.members).toHaveLength(2);
    });

    it('should return 404 for non-existent pool', async () => {
      const response = await request(app).get('/pools/non-existent-id/members');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Pool not found');
    });
  });

  describe('POST /pools/:id/members', () => {
    it('should add member to pool', async () => {
      const pool = await poolRepository.create({
        name: 'Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      const response = await request(app)
        .post(`/pools/${pool.id}/members`)
        .send({
          shipId: 'ship-1',
          units: 100,
        });

      expect(response.status).toBe(201);
      expect(response.body.member).toBeDefined();
      expect(response.body.member.shipId).toBe('ship-1');
      expect(response.body.member.allocatedUnits).toBe(100);
    });

    it('should return 404 for non-existent pool', async () => {
      const response = await request(app)
        .post('/pools/non-existent-id/members')
        .send({
          shipId: 'ship-1',
          units: 100,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Pool not found');
    });

    it('should reject invalid units', async () => {
      const pool = await poolRepository.create({
        name: 'Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      const response = await request(app)
        .post(`/pools/${pool.id}/members`)
        .send({
          shipId: 'ship-1',
          units: -100, // Invalid
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('DELETE /pools/:id/members/:shipId', () => {
    it('should remove member from pool', async () => {
      const pool = await poolRepository.create({
        name: 'Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      await poolRepository.addMember(pool.id, 'ship-1', 100);

      const response = await request(app).delete(`/pools/${pool.id}/members/ship-1`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent pool', async () => {
      const response = await request(app).delete('/pools/non-existent-id/members/ship-1');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Pool not found');
    });
  });

  describe('POST /pools/:id/allocate', () => {
    it('should allocate units to pool member', async () => {
      const pool = await poolRepository.create({
        name: 'Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      await poolRepository.addMember(pool.id, 'ship-1', 100);

      const response = await request(app)
        .post(`/pools/${pool.id}/allocate`)
        .send({
          shipId: 'ship-1',
          units: 50,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Units allocated successfully');
    });

    it('should return 404 for non-existent pool', async () => {
      const response = await request(app)
        .post('/pools/non-existent-id/allocate')
        .send({
          shipId: 'ship-1',
          units: 50,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Pool not found');
    });

    it('should reject invalid units', async () => {
      const pool = await poolRepository.create({
        name: 'Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      const response = await request(app)
        .post(`/pools/${pool.id}/allocate`)
        .send({
          shipId: 'ship-1',
          units: -50, // Invalid
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });
});

