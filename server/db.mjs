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

    add(name, quantity = 1) {
      const { lastInsertRowid } = db
        .prepare('INSERT INTO items (name, quantity) VALUES (?, ?)')
        .run(name, quantity);
      return rowToItem(db.prepare('SELECT * FROM items WHERE id = ?').get(lastInsertRowid));
    },

    // 局部更新：只更新 patch 中出现的字段；id 不存在返回 null
    update(id, patch) {
      const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
      if (!existing) return null;
      const next = {
        name: patch.name ?? existing.name,
        quantity: patch.quantity ?? existing.quantity,
        purchased: patch.purchased === undefined ? existing.purchased : Number(patch.purchased),
      };
      db.prepare('UPDATE items SET name = ?, quantity = ?, purchased = ? WHERE id = ?').run(
        next.name,
        next.quantity,
        next.purchased,
        id,
      );
      return rowToItem(db.prepare('SELECT * FROM items WHERE id = ?').get(id));
    },
  };
}
