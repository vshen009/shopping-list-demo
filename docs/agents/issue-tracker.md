# Issue Tracker 约定

本仓库的 issue tracker 就是 GitHub Issues（`vshen009/shopping-list-demo`），通过 `gh` CLI 操作。

## 开发包（dev package）格式

每个可供 agent 认领的 issue 必须包含：

- 中文标题与正文
- `## What to build` — 端到端描述这个垂直切片
- `## Acceptance criteria` — checklist（`- [ ]`），每条带显式等级标签
  `[L1]` / `[L2]` / `[L3]` / `[L4]`，AC 文本为中文
- `## Blocked by` — 依赖的前置 issue，或「None - can start immediately」

## 分支与 PR 约定

- batch 分支：`agent/<theme-slug>`，task 分支：`afk/issue-<number>-<slug>`
- task PR 以 batch 分支为 base，正文必须含 `Closes #<issue>`，开启 `--auto --squash`
- 永远不向 `main` 发 PR；batch 分支合入 `main` 由人工执行

## 并行安全

- 服务端口读 `PORT` 环境变量（默认 3000）；并行 L3 截图时各自用独立端口（如 3101、3102）
- 测试一律使用 `:memory:` 数据库；`data.db` 已被 gitignore，不得提交
