import Database from 'better-sqlite3';

// 数据访问模块（深模块）：封装全部 SQLite 细节。
// 传入 ':memory:' 可获得隔离的测试实例。
export function createStore(dbPath) {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      quantity   INTEGER NOT NULL DEFAULT 1,
      purchased  INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // 排序契约：已购沉底，组内最新在前
  const ORDER_BY = 'ORDER BY purchased ASC, created_at DESC, id DESC';

  const rowToItem = (row) => ({ ...row, purchased: Boolean(row.purchased) });

  return {
    list() {
      return db.prepare(`SELECT * FROM items ${ORDER_BY}`).all().map(rowToItem);
    },
  };
}
