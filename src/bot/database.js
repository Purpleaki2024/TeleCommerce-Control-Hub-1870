import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../..', 'shop.db');

// Enable verbose mode for debugging
sqlite3.verbose();

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to database');
  }
});

// Create database helper functions
const dbAsync = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  },
  
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// Initialize database schema
db.serialize(() => {
  // Menu configuration tables
  db.run(`CREATE TABLE IF NOT EXISTS menu_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL DEFAULT 'customer',
    menu_items TEXT NOT NULL,
    menu_structure TEXT NOT NULL DEFAULT '[]',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role)
  )`);

  // Payments table
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
  )`);

  // Payment logs table for audit trail
  db.run(`CREATE TABLE IF NOT EXISTS payment_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id TEXT NOT NULL,
    user_id INTEGER,
    order_id INTEGER,
    amount DECIMAL(10,2),
    status TEXT NOT NULL,
    webhook_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Default menu configuration
  db.run(`INSERT OR IGNORE INTO menu_config (role, menu_items, menu_structure) VALUES 
    ('customer', '["🛍️ Products","🛒 Cart","📋 Orders","ℹ️ Help"]', '[
      {"text":"🛍️ Products","command":"products","icon":"🛍️"},
      {"text":"🛒 Cart","command":"cart","icon":"🛒"},
      {"text":"📋 Orders","command":"orders","icon":"📋"},
      {"text":"ℹ️ Help","command":"help","icon":"ℹ️"}
    ]'),
    ('admin', '["🛍️ Products","📊 Dashboard","📦 Orders","📋 Inventory","👥 Users","⚙️ Settings"]', '[
      {"text":"🛍️ Products","command":"products","icon":"🛍️"},
      {"text":"📊 Dashboard","command":"dashboard","icon":"📊"},
      {"text":"📦 Orders","command":"admin_orders","icon":"📦","submenu":[
        {"text":"All Orders","command":"admin_orders"},
        {"text":"Pending","command":"admin_orders?status=pending"},
        {"text":"Completed","command":"admin_orders?status=completed"}
      ]},
      {"text":"📋 Inventory","command":"inventory","icon":"📋"},
      {"text":"👥 Users","command":"users","icon":"👥"},
      {"text":"⚙️ Settings","command":"settings","icon":"⚙️","submenu":[
        {"text":"General","command":"settings"},
        {"text":"Menu","command":"menu_settings"}
      ]}
    ]')
  `);
});

export { db, dbAsync };