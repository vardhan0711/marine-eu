import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from './helpers/test-app';

describe('Banking API', () => {
  const { app } = createTestApp();

  describe('POST /banking/bank-surplus', () => {
    it('should bank surplus units', async () => {
      const response = await request(app)
        .post('/banking/bank-surplus')
        .send({
          surplusUnits: 1000,
          bankingDate: new Date().toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.bankedUnits).toBe(1000);
      expect(response.body.result.originalSurplus).toBe(1000);
      expect(response.body.result.remainingSurplus).toBe(0);
    });

    it('should handle capacity limits', async () => {
      const response = await request(app)
        .post('/banking/bank-surplus')
        .send({
          surplusUnits: 10000,
          bankingDate: new Date().toISOString(),
          maxBankingCapacity: 5000,
        });

      expect(response.status).toBe(201);
      expect(response.body.result.bankedUnits).toBe(5000);
      expect(response.body.result.remainingSurplus).toBe(5000);
    });

    it('should handle custom validity years', async () => {
      const bankingDate = new Date('2024-01-01');
      const response = await request(app)
        .post('/banking/bank-surplus')
        .send({
          surplusUnits: 1000,
          bankingDate: bankingDate.toISOString(),
          bankingValidityYears: 3,
        });

      expect(response.status).toBe(201);
      const expiryDate = new Date(response.body.result.expiryDate);
      expect(expiryDate.getFullYear()).toBe(2027);
    });

    it('should reject negative surplus units', async () => {
      const response = await request(app)
        .post('/banking/bank-surplus')
        .send({
          surplusUnits: -1000,
          bankingDate: new Date().toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject invalid date format', async () => {
      const response = await request(app)
        .post('/banking/bank-surplus')
        .send({
          surplusUnits: 1000,
          bankingDate: 'invalid-date',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/banking/bank-surplus')
        .send({
          surplusUnits: 1000,
          // Missing bankingDate
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject invalid validity years', async () => {
      const response = await request(app)
        .post('/banking/bank-surplus')
        .send({
          surplusUnits: 1000,
          bankingDate: new Date().toISOString(),
          bankingValidityYears: 15, // Exceeds max
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('POST /banking/apply-banked', () => {
    it('should apply banked units to cover deficit', async () => {
      const bankedUnits = [
        {
          id: 'unit-1',
          units: 1000,
          bankedAt: new Date('2023-01-01').toISOString(),
          expiryDate: new Date('2025-01-01').toISOString(),
        },
      ];

      const response = await request(app)
        .post('/banking/apply-banked')
        .send({
          deficit: 500,
          applicationDate: new Date().toISOString(),
          availableBankedUnits: bankedUnits,
        });

      expect(response.status).toBe(200);
      expect(response.body.result.appliedUnits).toBe(500);
      expect(response.body.result.remainingDeficit).toBe(0);
      expect(response.body.result.usedBankedUnits).toHaveLength(1);
    });

    it('should handle insufficient banked units', async () => {
      const bankedUnits = [
        {
          id: 'unit-1',
          units: 500,
          bankedAt: new Date('2023-01-01').toISOString(),
          expiryDate: new Date('2025-01-01').toISOString(),
        },
      ];

      const response = await request(app)
        .post('/banking/apply-banked')
        .send({
          deficit: 2000,
          applicationDate: new Date().toISOString(),
          availableBankedUnits: bankedUnits,
        });

      expect(response.status).toBe(200);
      expect(response.body.result.appliedUnits).toBe(500);
      expect(response.body.result.remainingDeficit).toBe(1500);
    });

    it('should filter out expired units', async () => {
      const bankedUnits = [
        {
          id: 'unit-1',
          units: 1000,
          bankedAt: new Date('2021-01-01').toISOString(),
          expiryDate: new Date('2023-01-01').toISOString(), // Expired
        },
        {
          id: 'unit-2',
          units: 500,
          bankedAt: new Date('2023-01-01').toISOString(),
          expiryDate: new Date('2025-01-01').toISOString(), // Valid
        },
      ];

      const response = await request(app)
        .post('/banking/apply-banked')
        .send({
          deficit: 1000,
          applicationDate: new Date().toISOString(),
          availableBankedUnits: bankedUnits,
        });

      expect(response.status).toBe(200);
      expect(response.body.result.appliedUnits).toBe(500); // Only valid unit applied
      expect(response.body.result.remainingDeficit).toBe(500);
    });

    it('should reject invalid deficit', async () => {
      const response = await request(app)
        .post('/banking/apply-banked')
        .send({
          deficit: -100,
          applicationDate: new Date().toISOString(),
          availableBankedUnits: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject invalid banked unit ID format', async () => {
      const response = await request(app)
        .post('/banking/apply-banked')
        .send({
          deficit: 1000,
          applicationDate: new Date().toISOString(),
          availableBankedUnits: [
            {
              id: 'invalid-uuid',
              units: 1000,
              bankedAt: new Date().toISOString(),
              expiryDate: new Date().toISOString(),
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/banking/apply-banked')
        .send({
          deficit: 1000,
          // Missing other fields
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('GET /banking/entries', () => {
    it('should return bank entries', async () => {
      const response = await request(app).get('/banking/entries');

      expect(response.status).toBe(200);
      expect(response.body.entries).toBeDefined();
      expect(Array.isArray(response.body.entries)).toBe(true);
    });

    it('should filter by shipId', async () => {
      const response = await request(app)
        .get('/banking/entries')
        .query({ shipId: 'ship-1' });

      expect(response.status).toBe(200);
      expect(response.body.entries).toBeDefined();
    });

    it('should filter by expired status', async () => {
      const response = await request(app)
        .get('/banking/entries')
        .query({ expired: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.entries).toBeDefined();
    });
  });
});

