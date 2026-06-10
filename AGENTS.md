# AGENTS.md — agent 开发须知

开工前必读：[docs/prd.md](docs/prd.md)（产品决策的唯一来源）、
[docs/agents/issue-tracker.md](docs/agents/issue-tracker.md)（开发包格式与分支/PR 约定）、
[docs/agents/triage-labels.md](docs/agents/triage-labels.md)（标签词汇表）、
[CONTEXT.md](CONTEXT.md)（领域词汇）。

## 常用命令

```bash
npm install        # 安装依赖
npm test           # vitest run（测试全部走 :memory: 库）
npm start          # 启动服务，默认 3000 端口
PORT=3101 npm start   # 指定端口启动（并行验证时必须各用独立端口）
```

## 架构与模块边界

- `server/db.mjs` —— 数据访问深模块。全部 SQL 只能写在这里；对外只暴露
  `createStore(dbPath)` 返回的方法集。排序契约（已购沉底、组内最新在前）在此模块内维护。
- `server/index.mjs` —— Express 薄层。`createApp(store)` 工厂 + 路由 + 静态文件；
  路由里不写 SQL、不写校验规则本体。
- 校验规则（名称 1–50 字符、数量 1–99 整数）属于独立校验模块（纯函数），
  由对应开发包创建；错误消息为中文，响应统一 `{ "error": "中文消息" }`。
- `public/` —— 原生 HTML/JS 单页，无构建步骤，界面文案全中文。

## 硬性规则

1. **测试必须用 `:memory:` 库**。任何测试不得读写 `data.db`（已 gitignore，不得提交）。
2. **端口必须可由 `PORT` 环境变量指定**。并行做浏览器（L3）验证时各 agent 用独立端口。
3. **界面与错误文案全中文**；校验错误用行内提示，不用 toast / alert / confirm。
4. **只测外部行为**：断言 HTTP 状态码、响应体、列表顺序、页面可见状态；不断言内部实现。
5. 分支、PR、标签、AC 验证与证据提交规则见 `docs/agents/issue-tracker.md`，
   L3 截图证据提交到任务分支的 `.afk/evidence/issue-<n>/` 目录。
6. 永远不向 `main` 发 PR；task PR 的 base 是 batch 分支（`agent/<theme-slug>`）。
