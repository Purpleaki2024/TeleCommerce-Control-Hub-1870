// Add payment-related tables to database initialization
db.serialize(() => {
  // ... existing tables ...

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
});