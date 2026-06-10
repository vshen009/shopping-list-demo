# Triage 标签词汇表

| 标签 | 含义 | 谁来打 |
|---|---|---|
| `ready-for-agent` | 开发包已就绪，AC 完整且带等级标签，agent 可认领 | 人 / to-issues |
| `agent-claimed` | agent 已认领（认领锁的一半，另一半是结构化评论） | agent |
| `agent-in-progress` | agent 正在实现中 | agent |
| `agent-failed` | 实现或 AC 验证失败，需人工介入；移除本标签和 `agent-claimed` 后可重新排队 | agent |

规则：

- 只有带 `ready-for-agent` 且无任何 `agent-*` 标签的 issue 才是可认领的
- `agent-failed` 出现时，issue 上会有失败评论说明失败的 AC、等级与观察到的输出
- 标签由 `gh label` 管理，不要手工改名
