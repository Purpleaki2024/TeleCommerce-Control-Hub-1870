// Add to database initialization
db.serialize(() => {
  // ... existing tables ...

  // Failed notifications table
  db.run(`CREATE TABLE IF NOT EXISTS failed_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    retry_count INTEGER DEFAULT 0
  )`);

  // Notification retry job
  db.run(`CREATE TABLE IF NOT EXISTS notification_retry_job (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_run DATETIME,
    next_run DATETIME DEFAULT datetime('now', '+1 hour')
  )`);
});