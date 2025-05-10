// Add to existing handlers
export const handleFloatingMenu = async (bot, msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    resize_keyboard: true,
    one_time_keyboard: false,
    keyboard: [
      [{ text: '🛍️ Products' }, { text: '🛒 Cart' }],
      [{ text: '📋 Orders' }, { text: 'ℹ️ Help' }],
      [{ text: '👤 Account' }]
    ]
  };

  await bot.sendMessage(
    chatId,
    'Main Menu - Select an option:',
    { reply_markup: keyboard }
  );
};

export const handleOrderHistory = async (bot, msg) => {
  const chatId = msg.chat.id;
  
  try {
    const orders = await new Promise((resolve, reject) => {
      db.all(
        `SELECT o.id, o.total_amount, o.status, o.created_at, 
         COUNT(oi.id) as item_count
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         WHERE o.user_id = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC
         LIMIT 10`,
        [chatId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    if (orders.length === 0) {
      await bot.sendMessage(
        chatId,
        "📋 You don't have any orders yet. Start shopping to see your order history here!"
      );
      return;
    }

    let message = '📋 *Your Recent Orders*\n\n';
    orders.forEach(order => {
      message += `🆔 *Order #${order.id}*\n`;
      message += `💰 Total: $${order.total_amount.toFixed(2)}\n`;
      message += `📅 Date: ${new Date(order.created_at).toLocaleDateString()}\n`;
      message += `📦 Items: ${order.item_count}\n`;
      message += `🟢 Status: ${order.status}\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        ...orders.map(order => [
          { 
            text: `📦 View Order #${order.id}`,
            callback_data: `view_order_${order.id}`
          }
        ]),
        [
          { text: '🛍️ Continue Shopping', callback_data: 'continue_shopping' }
        ]
      ]
    };

    await bot.sendMessage(
      chatId,
      message,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );
  } catch (error) {
    console.error('Error fetching orders:', error);
    await bot.sendMessage(
      chatId,
      '❌ Failed to load your order history. Please try again later.'
    );
  }
};

export const handleOrderDetails = async (bot, query, orderId) => {
  const chatId = query.message.chat.id;
  
  try {
    const [order, items] = await Promise.all([
      new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
          [orderId, chatId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      }),
      new Promise((resolve, reject) => {
        db.all(
          `SELECT oi.*, p.name 
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [orderId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      })
    ]);

    if (!order) {
      await bot.answerCallbackQuery(
        query.id,
        { text: 'Order not found', show_alert: true }
      );
      return;
    }

    let message = `📦 *Order #${order.id}*\n\n`;
    message += `📅 Date: ${new Date(order.created_at).toLocaleString()}\n`;
    message += `🟢 Status: ${order.status}\n`;
    message += `💰 Total: $${order.total_amount.toFixed(2)}\n\n`;
    message += `*Items Purchased:*\n`;

    items.forEach(item => {
      message += `➡️ ${item.name} (${item.quantity} × $${item.price_at_purchase.toFixed(2)})\n`;
      message += `   Subtotal: $${(item.quantity * item.price_at_purchase).toFixed(2)}\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📋 Back to Orders', callback_data: 'view_orders' },
          { text: '🛍️ Shop Again', callback_data: 'continue_shopping' }
        ]
      ]
    };

    await bot.editMessageText(
      message,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Error fetching order details:', error);
    await bot.answerCallbackQuery(
      query.id,
      { text: 'Failed to load order details', show_alert: true }
    );
  }
};

// Update the main bot setup to include new handlers
export const setupBotCommands = (bot) => {
  // ... existing command setup ...

  // Add new commands
  bot.onText(/\/menu/, (msg) => handleFloatingMenu(bot, msg));
  bot.onText(/\/orders/, (msg) => handleOrderHistory(bot, msg));

  // Update callback query handler
  bot.on('callback_query', async (query) => {
    try {
      const action = query.data;
      
      if (action === 'view_orders') {
        await handleOrderHistory(bot, query.message);
      }
      else if (action.startsWith('view_order_')) {
        const orderId = action.split('_')[2];
        await handleOrderDetails(bot, query, orderId);
      }
      // ... existing callback handlers ...
      
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error('Callback query error:', error);
      await bot.answerCallbackQuery(
        query.id, 
        { text: 'An error occurred', show_alert: true }
      );
    }
  });
};