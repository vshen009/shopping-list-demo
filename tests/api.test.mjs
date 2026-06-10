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

describe('PATCH /api/items/:id（勾选已购）', () => {
  it('传 purchased: true 返回 200 和更新后的 item，后续 GET 中生效', async () => {
    const app = freshApp();
    const created = await request(app).post('/api/items').send({ name: '牛奶' });
    const res = await request(app)
      .patch(`/api/items/${created.body.id}`)
      .send({ purchased: true });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: created.body.id, name: '牛奶', purchased: true });
    const list = await request(app).get('/api/items');
    expect(list.body.find((i) => i.id === created.body.id).purchased).toBe(true);
  });

  it('已购项在 GET 返回顺序中排在所有待购项之后（沉底）', async () => {
    const app = freshApp();
    await request(app).post('/api/items').send({ name: '牛奶' });
    const apple = await request(app).post('/api/items').send({ name: '苹果' });
    await request(app).patch(`/api/items/${apple.body.id}`).send({ purchased: true });
    await request(app).post('/api/items').send({ name: '面包' });
    // 按时间序苹果应在牛奶前；沉底后苹果必须排到所有待购项之后
    const list = await request(app).get('/api/items');
    expect(list.body.map((i) => i.name)).toEqual(['面包', '牛奶', '苹果']);
  });

  it('PATCH 不存在的 id 返回 404 和中文错误', async () => {
    const res = await request(freshApp()).patch('/api/items/999').send({ purchased: true });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/[一-龥]/);
  });
});

describe('POST /api/items 输入校验', () => {
  it('空名称或纯空白名称返回 400 和中文错误', async () => {
    const app = freshApp();
    for (const name of ['', '   ']) {
      const res = await request(app).post('/api/items').send({ name });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/[一-龥]/);
    }
  });

  it('名称 51 字符返回 400；50 字符成功创建', async () => {
    const app = freshApp();
    const tooLong = await request(app).post('/api/items').send({ name: '货'.repeat(51) });
    expect(tooLong.status).toBe(400);
    const ok = await request(app).post('/api/items').send({ name: '货'.repeat(50) });
    expect(ok.status).toBe(201);
  });

  it('数量 0、100、非整数返回 400；1 和 99 成功', async () => {
    const app = freshApp();
    for (const quantity of [0, 100, 2.5]) {
      const res = await request(app).post('/api/items').send({ name: '牛奶', quantity });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/[一-龥]/);
    }
    for (const quantity of [1, 99]) {
      const res = await request(app).post('/api/items').send({ name: '牛奶', quantity });
      expect(res.status).toBe(201);
    }
  });
});
