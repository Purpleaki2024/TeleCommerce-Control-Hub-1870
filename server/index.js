// Add to existing server routes
app.get('/api/orders/export/csv', async (req, res) => {
  try {
    const status = req.query.status || 'all';
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let query = `
      SELECT o.*, u.username 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push('o.status = ?');
      params.push(status);
    }

    if (startDate) {
      conditions.push('o.created_at >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('o.created_at <= ?');
      params.push(endDate + ' 23:59:59');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY o.created_at DESC';

    const orders = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get order items for all orders
    const ordersWithItems = await Promise.all(
      orders.map(async order => {
        const items = await new Promise((resolve, reject) => {
          db.all(
            `SELECT oi.*, p.name 
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [order.id],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        });
        return { ...order, items };
      })
    );

    // Generate CSV
    let csv = 'Order ID,Date,Status,User ID,Username,Total,Items\n';
    
    ordersWithItems.forEach(order => {
      const items = order.items.map(item => 
        `${item.name} (${item.quantity} × $${item.price_at_purchase})`
      ).join('; ');
      
      csv += `"${order.id}","${order.created_at}","${order.status}",` +
             `"${order.user_id}","${order.username || ''}","${order.total_amount}",` +
             `"${items}"\n`;
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition', 
      'attachment; filename=orders_export.csv'
    );
    res.send(csv);

  } catch (error) {
    console.error('CSV export failed:', error);
    res.status(500).json({ error: 'Failed to generate CSV export' });
  }
});

// Update the order status endpoint to send notifications
app.patch('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    // Get current order first
    const currentOrder = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM orders WHERE id = ?`,
        [orderId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE orders 
         SET status = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [status, orderId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Get updated order with items
    const updatedOrder = await new Promise((resolve, reject) => {
      db.get(
        `SELECT o.*, u.username 
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         WHERE o.id = ?`,
        [orderId],
        async (err, order) => {
          if (err) return reject(err);
          
          const items = await new Promise((resolve, reject) => {
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
          });
          
          resolve({ ...order, items });
        }
      );
    });

    // Send notification if status changed
    if (currentOrder.status !== status) {
      try {
        await notificationService.sendOrderNotification(
          updatedOrder.user_id, 
          updatedOrder
        );
      } catch (error) {
        console.error('Notification error:', error);
      }
    }

    res.json(updatedOrder);

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: error.message });
  }
});