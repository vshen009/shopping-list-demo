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

describe('POST /api/items（添加清单项）', () => {
  it('传名称返回 201 和完整 item（quantity 默认 1，purchased 为 false）', async () => {
    const res = await request(freshApp()).post('/api/items').send({ name: '牛奶' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: '牛奶', quantity: 1, purchased: false });
    expect(res.body.id).toBeTypeOf('number');
    expect(res.body.created_at).toBeTruthy();
  });

  it('传名称和数量创建数量为 12 的项', async () => {
    const res = await request(freshApp())
      .post('/api/items')
      .send({ name: '鸡蛋', quantity: 12 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: '鸡蛋', quantity: 12 });
  });

  it('连续两次 POST 相同名称，创建两条独立记录', async () => {
    const app = freshApp();
    const first = await request(app).post('/api/items').send({ name: '牛奶' });
    const second = await request(app).post('/api/items').send({ name: '牛奶' });
    expect(first.body.id).not.toBe(second.body.id);
    const list = await request(app).get('/api/items');
    expect(list.body.filter((i) => i.name === '牛奶')).toHaveLength(2);
  });

  it('新建项在后续 GET 中返回，最新创建的待购项排在最前', async () => {
    const app = freshApp();
    await request(app).post('/api/items').send({ name: '面包' });
    await request(app).post('/api/items').send({ name: '苹果' });
    const list = await request(app).get('/api/items');
    expect(list.body.map((i) => i.name)).toEqual(['苹果', '面包']);
  });
});
