import TelegramBot from 'node-telegram-bot-api';
import config from './config.js';
import db from './database.js';

class NotificationService {
  constructor(bot) {
    this.bot = bot;
  }

  async sendOrderNotification(userId, order) {
    try {
      let message = `📦 *Order Update*\n\n`;
      message += `🆔 Order #${order.id}\n`;
      message += `🟢 Status: ${order.status}\n`;
      message += `💰 Total: $${order.total_amount.toFixed(2)}\n\n`;
      
      if (order.items && order.items.length > 0) {
        message += `*Items:*\n`;
        order.items.forEach(item => {
          message += `➡️ ${item.name} (${item.quantity} × $${item.price_at_purchase.toFixed(2)})\n`;
        });
      }

      await this.bot.sendMessage(
        userId,
        message,
        { parse_mode: 'Markdown' }
      );

      // Add emoji based on status
      let statusEmoji = 'ℹ️';
      if (order.status === 'shipped') statusEmoji = '🚚';
      if (order.status === 'completed') statusEmoji = '✅';
      if (order.status === 'cancelled') statusEmoji = '❌';

      await this.bot.sendMessage(
        userId,
        `${statusEmoji} Your order #${order.id} status has been updated to: *${order.status}*`,
        { parse_mode: 'Markdown' }
      );

    } catch (error) {
      console.error('Error sending order notification:', error);
      // Log failed notifications for later retry
      db.run(
        `INSERT INTO failed_notifications 
         (user_id, order_id, error, created_at) 
         VALUES (?, ?, ?, datetime('now'))`,
        [userId, order.id, error.message]
      );
    }
  }

  async notifyAdmin(order, action) {
    try {
      const adminMessage = `👤 *Admin Action*\n\n` +
        `Action: ${action}\n` +
        `Order #${order.id}\n` +
        `User: ${order.user_id}\n` +
        `Status: ${order.status}\n` +
        `Total: $${order.total_amount.toFixed(2)}`;

      // Send to all admins
      for (const adminId of config.adminIds) {
        await this.bot.sendMessage(
          adminId,
          adminMessage,
          { parse_mode: 'Markdown' }
        );
      }
    } catch (error) {
      console.error('Error notifying admin:', error);
    }
  }
}

export let notificationService;

export function initNotificationService(bot) {
  notificationService = new NotificationService(bot);
  
  // Create table for failed notifications if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS failed_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    retry_count INTEGER DEFAULT 0
  )`);
}