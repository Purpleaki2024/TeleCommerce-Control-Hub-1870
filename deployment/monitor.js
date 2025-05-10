// Add to monitoring script
async function retryFailedNotifications() {
  try {
    // Check if it's time to run
    const shouldRun = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM notification_retry_job 
         WHERE next_run <= datetime('now') 
         OR last_run IS NULL 
         LIMIT 1`,
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });

    if (!shouldRun) return;

    // Get failed notifications
    const failedNotifications = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM failed_notifications 
         WHERE retry_count < 3 
         ORDER BY created_at ASC 
         LIMIT 10`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    for (const notification of failedNotifications) {
      try {
        const order = await new Promise((resolve, reject) => {
          db.get(
            `SELECT o.*, 
             (SELECT GROUP_CONCAT(oi.product_id || '|' || oi.quantity || '|' || p.name, ';') 
              FROM order_items oi
              JOIN products p ON oi.product_id = p.id
              WHERE oi.order_id = o.id) as items
             FROM orders o
             WHERE o.id = ?`,
            [notification.order_id],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        });

        if (order) {
          // Format items for notification
          order.items = order.items?.split(';').map(item => {
            const [product_id, quantity, name] = item.split('|');
            return { product_id, quantity, name };
          }) || [];

          await notificationService.sendOrderNotification(
            notification.user_id,
            order
          );

          // Remove from failed notifications
          await new Promise((resolve, reject) => {
            db.run(
              `DELETE FROM failed_notifications WHERE id = ?`,
              [notification.id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      } catch (error) {
        console.error(`Retry failed for notification ${notification.id}:`, error);
        
        // Increment retry count
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE failed_notifications 
             SET retry_count = retry_count + 1 
             WHERE id = ?`,
            [notification.id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }

    // Update job status
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO notification_retry_job 
         (id, last_run, next_run) 
         VALUES (1, datetime('now'), datetime('now', '+1 hour'))`,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

  } catch (error) {
    console.error('Notification retry job failed:', error);
  }
}

// Add to monitor function
async function monitor() {
  try {
    const [diskSpace, memory, processes] = await Promise.all([
      checkDiskSpace(),
      checkMemory(),
      checkProcessStatus(),
      retryFailedNotifications() // Run notification retries
    ]);
    
    // ... rest of monitoring logic ...
  } catch (error) {
    console.error('Monitoring failed:', error);
  }
}