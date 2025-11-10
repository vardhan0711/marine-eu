import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from './helpers/test-app';

describe('Health Check', () => {
  const { app } = createTestApp();

  it('should return health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

