import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStore } from './db.mjs';

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

// app 工厂：测试时注入 :memory: store，生产时注入文件 store
export function createApp(store) {
  const app = express();
  app.use(express.json());
  app.use(express.static(PUBLIC_DIR));

  app.get('/api/items', (req, res) => {
    res.json(store.list());
  });

  app.post('/api/items', (req, res) => {
    const { name, quantity } = req.body ?? {};
    const item = store.add(name, quantity ?? 1);
    res.status(201).json(item);
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
