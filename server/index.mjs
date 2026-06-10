import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStore } from './db.mjs';
import { validateItemInput, validateItemPatch } from './validation.mjs';

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

// app 工厂：测试时注入 :memory: store，生产时注入文件 store
export function createApp(store) {
  const app = express();
  app.use(express.json());
  app.use(express.static(PUBLIC_DIR));

  app.get('/api/items', (req, res) => {
    res.json(store.list(req.query.filter));
  });

  app.delete('/api/items', (req, res) => {
    if (req.query.purchased !== 'true') {
      res.status(400).json({ error: '批量删除必须指定 purchased=true' });
      return;
    }
    res.json({ deleted: store.clearPurchased() });
  });

  app.post('/api/items', (req, res) => {
    const result = validateItemInput(req.body ?? {});
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    const item = store.add(result.value.name, result.value.quantity);
    res.status(201).json(item);
  });

  app.delete('/api/items/:id', (req, res) => {
    if (!store.remove(Number(req.params.id))) {
      res.status(404).json({ error: '该清单项不存在' });
      return;
    }
    res.status(204).end();
  });

  app.patch('/api/items/:id', (req, res) => {
    const result = validateItemPatch(req.body ?? {});
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    const item = store.update(Number(req.params.id), result.value);
    if (!item) {
      res.status(404).json({ error: '该清单项不存在' });
      return;
    }
    res.json(item);
  });

  return app;
}

// 直接运行时启动服务；端口读 PORT 环境变量（并行开发各用独立端口）
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3000;
  const store = createStore(process.env.DB_PATH || 'data.db');
  createApp(store).listen(port, () => {
    console.log(`购物清单服务已启动: http://localhost:${port}`);
  });
}
