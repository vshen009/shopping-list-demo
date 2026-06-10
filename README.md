# 购物清单 Shopping List Demo

一个单页购物清单应用，作为 [vstack](https://github.com/vshen009/vstack) 中 `afk-agent` 技能的演示项目：
PRD 和开发包（issues）由 `grill-me` / `to-prd` / `to-issues` 生成，功能切片由 `afk-agent`
并行实现，验收证据分 L1（grep）/ L2（测试）/ L3（浏览器截图）/ L4（人工）四级。

## 技术栈

- 后端：Node + Express
- 数据库：better-sqlite3（本地 `data.db` 文件）
- 前端：原生 HTML/JS 单页，无构建步骤
- 测试：Vitest + supertest

## 运行

```bash
npm install
npm test           # 测试（内存库，不碰 data.db）
node server/index.mjs   # 默认 3000 端口，可用 PORT 环境变量覆盖
```

## 仓库结构

- `server/` — Express 应用 + SQLite 访问层
- `public/` — 单页前端
- `tests/` — API 行为测试
- `docs/prd.md` — 产品需求文档
- `docs/agents/` — agent 协作配置（issue tracker 约定、triage 标签）
- `.afk/evidence/` — afk-agent 提交的 L3 截图证据
