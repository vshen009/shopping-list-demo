import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/index.mjs';
import { createStore } from '../server/db.mjs';

// 测试一律使用 :memory: 库，互不干扰、不碰 data.db
function freshApp() {
  return createApp(createStore(':memory:'));
}

describe('GET /api/items', () => {
  it('空清单返回空数组', async () => {
    const res = await request(freshApp()).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('静态页面', () => {
  it('/ 返回购物清单页面', async () => {
    const res = await request(freshApp()).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('购物清单');
  });
});
