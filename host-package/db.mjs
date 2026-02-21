import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "cartech.db"), { verbose: null });

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Schema ───

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    telegram_id  INTEGER PRIMARY KEY,
    name         TEXT DEFAULT '',
    phone        TEXT DEFAULT '',
    region       TEXT DEFAULT '',
    city         TEXT DEFAULT '',
    address      TEXT DEFAULT '',
    email        TEXT DEFAULT '',
    created_at   TEXT DEFAULT (datetime('now')),
    updated_at   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS garages (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
    brand        TEXT NOT NULL,
    brand_id     TEXT NOT NULL DEFAULT '',
    model        TEXT NOT NULL,
    year         INTEGER,
    engine       TEXT DEFAULT '',
    is_primary   INTEGER DEFAULT 0,
    created_at   TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_garages_user ON garages(user_id);

  CREATE TABLE IF NOT EXISTS orders (
    id               TEXT PRIMARY KEY,
    user_id          INTEGER,
    status           TEXT DEFAULT 'pending',
    customer_name    TEXT DEFAULT '',
    customer_phone   TEXT DEFAULT '',
    customer_region  TEXT DEFAULT '',
    customer_city    TEXT DEFAULT '',
    customer_address TEXT DEFAULT '',
    comment          TEXT DEFAULT '',
    total            REAL DEFAULT 0,
    tracking_number  TEXT DEFAULT '',
    tracking_carrier TEXT DEFAULT '',
    telegram_id      INTEGER,
    created_at       TEXT DEFAULT (datetime('now')),
    updated_at       TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

  CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT DEFAULT '',
    name       TEXT NOT NULL,
    brand      TEXT DEFAULT '',
    part_number TEXT DEFAULT '',
    price      REAL DEFAULT 0,
    quantity   INTEGER DEFAULT 1
  );
  CREATE INDEX IF NOT EXISTS idx_oitems_order ON order_items(order_id);

  CREATE TABLE IF NOT EXISTS support_sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    user_name   TEXT DEFAULT '',
    user_tg     TEXT DEFAULT '',
    phone       TEXT DEFAULT '',
    car         TEXT DEFAULT '',
    question    TEXT DEFAULT '',
    status      TEXT DEFAULT 'waiting',
    created_at  TEXT DEFAULT (datetime('now')),
    accepted_at TEXT,
    closed_at   TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_sup_user   ON support_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sup_status ON support_sessions(status);

  CREATE TABLE IF NOT EXISTS support_messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES support_sessions(id) ON DELETE CASCADE,
    sender     TEXT NOT NULL,
    text       TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_supmsg_session ON support_messages(session_id);

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT DEFAULT ''
  );
`);

// ─── Users / Profiles ───

const _upsertUser = db.prepare(`
  INSERT INTO users (telegram_id) VALUES (@id)
  ON CONFLICT(telegram_id) DO NOTHING
`);
const _getUser = db.prepare(`SELECT * FROM users WHERE telegram_id = ?`);
// Field updates are done via dynamic prepare in setProfileField()

export function ensureUser(telegramId) {
  _upsertUser.run({ id: telegramId });
}

export function getProfile(telegramId) {
  ensureUser(telegramId);
  return _getUser.get(telegramId);
}

export function setProfileField(telegramId, field, value) {
  const allowed = ["name", "phone", "region", "city", "address", "email"];
  if (!allowed.includes(field)) return;
  ensureUser(telegramId);
  db.prepare(
    `UPDATE users SET ${field} = ?, updated_at = datetime('now') WHERE telegram_id = ?`
  ).run(value, telegramId);
}

export function getAllUsers() {
  return db.prepare(`SELECT * FROM users ORDER BY created_at DESC`).all();
}

export function getUserCount() {
  return db.prepare(`SELECT count(*) as cnt FROM users`).get().cnt;
}

export function getAllUserIds() {
  return db.prepare(`SELECT telegram_id FROM users`).all().map(r => r.telegram_id);
}

// ─── Garage ───

export function getGarage(userId) {
  ensureUser(userId);
  return db.prepare(
    `SELECT * FROM garages WHERE user_id = ? ORDER BY is_primary DESC, created_at DESC`
  ).all(userId);
}

export function addCar(userId, car) {
  ensureUser(userId);
  db.prepare(`UPDATE garages SET is_primary = 0 WHERE user_id = ?`).run(userId);
  db.prepare(`
    INSERT INTO garages (user_id, brand, brand_id, model, year, engine, is_primary)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(userId, car.brand, car.brandId || "", car.model, car.year, car.engine || "");
}

export function clearGarage(userId) {
  db.prepare(`DELETE FROM garages WHERE user_id = ?`).run(userId);
}

export function getGarageCount() {
  return db.prepare(`SELECT count(DISTINCT user_id) as cnt FROM garages`).get().cnt;
}

// ─── Orders ───

export function getOrder(orderId) {
  const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId);
  if (!order) return null;
  order.items = db.prepare(`SELECT * FROM order_items WHERE order_id = ?`).all(orderId);
  return order;
}

export function getAllOrders() {
  const rows = db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`).all();
  for (const row of rows) {
    row.items = db.prepare(`SELECT * FROM order_items WHERE order_id = ?`).all(row.id);
  }
  return rows;
}

export function getOrderCount() {
  return db.prepare(`SELECT count(*) as cnt FROM orders`).get().cnt;
}

export function getPendingOrderCount() {
  return db.prepare(`SELECT count(*) as cnt FROM orders WHERE status = 'pending'`).get().cnt;
}

export function upsertOrder(order) {
  db.prepare(`
    INSERT INTO orders (id, user_id, status, customer_name, customer_phone,
      customer_region, customer_city, customer_address, comment, total,
      tracking_number, tracking_carrier, telegram_id, created_at, updated_at)
    VALUES (@id, @user_id, @status, @customer_name, @customer_phone,
      @customer_region, @customer_city, @customer_address, @comment, @total,
      @tracking_number, @tracking_carrier, @telegram_id, @created_at, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      status = @status,
      customer_name = @customer_name,
      customer_phone = @customer_phone,
      customer_region = @customer_region,
      customer_city = @customer_city,
      customer_address = @customer_address,
      comment = @comment,
      total = @total,
      tracking_number = @tracking_number,
      tracking_carrier = @tracking_carrier,
      telegram_id = @telegram_id,
      updated_at = @updated_at
  `).run({
    id: order.id,
    user_id: order.userId || order.telegramId || null,
    status: order.status || "pending",
    customer_name: order.customerName || "",
    customer_phone: order.customerPhone || "",
    customer_region: order.customerRegion || "",
    customer_city: order.customerCity || "",
    customer_address: order.customerAddress || "",
    comment: order.comment || "",
    total: order.total || 0,
    tracking_number: order.trackingNumber || "",
    tracking_carrier: order.trackingCarrier || "",
    telegram_id: order.telegramId || null,
    created_at: order.createdAt || new Date().toISOString(),
    updated_at: order.updatedAt || new Date().toISOString(),
  });

  if (order.items && order.items.length > 0) {
    db.prepare(`DELETE FROM order_items WHERE order_id = ?`).run(order.id);
    const ins = db.prepare(`
      INSERT INTO order_items (order_id, product_id, name, brand, part_number, price, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const item of order.items) {
      ins.run(order.id, item.productId || "", item.name, item.brand || "", item.partNumber || "", item.price || 0, item.quantity || 1);
    }
  }
}

export function updateOrderStatus(orderId, status) {
  db.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, orderId);
}

export function updateOrderTracking(orderId, trackingNumber, carrier) {
  db.prepare(`
    UPDATE orders SET tracking_number = ?, tracking_carrier = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(trackingNumber, carrier, orderId);
}

export function deleteOrder(orderId) {
  db.prepare(`DELETE FROM order_items WHERE order_id = ?`).run(orderId);
  db.prepare(`DELETE FROM orders WHERE id = ?`).run(orderId);
}

// ─── Support Sessions ───

export function createSupportSession(userId, data) {
  closeActiveSupportSessions(userId);
  const info = db.prepare(`
    INSERT INTO support_sessions (user_id, user_name, user_tg, phone, car, question, status)
    VALUES (?, ?, ?, ?, ?, ?, 'waiting')
  `).run(userId, data.userName || "", data.userTgName || "", data.phone || "", data.car || "", data.question || "");

  const sessionId = info.lastInsertRowid;
  if (data.question) {
    db.prepare(`INSERT INTO support_messages (session_id, sender, text) VALUES (?, 'user', ?)`)
      .run(sessionId, data.question);
  }
  return sessionId;
}

export function getActiveSupportSession(userId) {
  return db.prepare(
    `SELECT * FROM support_sessions WHERE user_id = ? AND status IN ('waiting','active') ORDER BY id DESC LIMIT 1`
  ).get(userId);
}

export function getSupportSession(sessionId) {
  return db.prepare(`SELECT * FROM support_sessions WHERE id = ?`).get(sessionId);
}

export function getWaitingSupportSessions() {
  return db.prepare(`SELECT * FROM support_sessions WHERE status = 'waiting' ORDER BY created_at ASC`).all();
}

export function getActiveSupportSessions() {
  return db.prepare(`SELECT * FROM support_sessions WHERE status = 'active' ORDER BY accepted_at DESC`).all();
}

export function acceptSupportSession(sessionId) {
  db.prepare(`UPDATE support_sessions SET status = 'active', accepted_at = datetime('now') WHERE id = ?`).run(sessionId);
}

export function closeSupportSession(sessionId) {
  db.prepare(`UPDATE support_sessions SET status = 'closed', closed_at = datetime('now') WHERE id = ?`).run(sessionId);
}

export function closeActiveSupportSessions(userId) {
  db.prepare(`UPDATE support_sessions SET status = 'closed', closed_at = datetime('now') WHERE user_id = ? AND status IN ('waiting','active')`).run(userId);
}

export function addSupportMessage(sessionId, sender, text) {
  db.prepare(`INSERT INTO support_messages (session_id, sender, text) VALUES (?, ?, ?)`).run(sessionId, sender, text);
}

export function getSupportMessages(sessionId, limit = 50) {
  return db.prepare(`SELECT * FROM support_messages WHERE session_id = ? ORDER BY id DESC LIMIT ?`).all(sessionId, limit).reverse();
}

// ─── Settings (key-value) ───

export function getSetting(key, defaultValue = "") {
  const row = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key);
  return row ? row.value : defaultValue;
}

export function setSetting(key, value) {
  db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?`).run(key, value, value);
}

export function getMarkup() {
  return parseFloat(getSetting("markup", "0")) || 0;
}

export function setMarkup(val) {
  setSetting("markup", String(val));
}

// ─── Close DB on exit ───

process.on("exit", () => db.close());
process.on("SIGINT", () => { db.close(); process.exit(0); });
process.on("SIGTERM", () => { db.close(); process.exit(0); });

export default db;
