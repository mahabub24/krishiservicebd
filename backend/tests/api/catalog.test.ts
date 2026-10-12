import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';

describe('Public Catalog & Health API', () => {
  it('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/v1/categories returns seeded categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/products returns seeded products with pagination', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('products');
    expect(res.body.data).toHaveProperty('pagination');
    expect(Array.isArray(res.body.data.products)).toBe(true);
  });

  it('GET /api/v1/products/featured returns featured groups', async () => {
    const res = await request(app).get('/api/v1/products/featured');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('featured');
    expect(res.body.data).toHaveProperty('newArrivals');
    expect(res.body.data).toHaveProperty('offers');
    expect(res.body.data).toHaveProperty('bestSellers');
  });

  it('GET /api/v1/settings returns public settings without secrets', async () => {
    const res = await request(app).get('/api/v1/settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('store_name_bn');
    // Ensure credentials or non-whitelisted items are not leaked
    expect(res.body.data).not.toHaveProperty('databaseUrl');
    expect(res.body.data).not.toHaveProperty('jwtSecret');
  });
});
