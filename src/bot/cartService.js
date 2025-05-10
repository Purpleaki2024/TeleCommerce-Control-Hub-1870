import db from './database.js';

class CartService {
  // Get or create cart for user
  async getCart(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM carts WHERE user_id = ?`,
        [userId],
        async (err, cart) => {
          if (err) return reject(err);
          if (!cart) {
            // Create new cart if none exists
            db.run(
              `INSERT INTO carts (user_id) VALUES (?)`,
              [userId],
              function(err) {
                if (err) return reject(err);
                resolve({ id: this.lastID, user_id: userId, items: [] });
              }
            );
          } else {
            const items = await this.getCartItems(cart.id);
            resolve({ ...cart, items });
          }
        }
      );
    });
  }

  // Get cart items
  async getCartItems(cartId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT ci.*, p.name, p.price, p.stock 
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = ?`,
        [cartId],
        (err, items) => {
          if (err) return reject(err);
          resolve(items);
        }
      );
    });
  }

  // Add item to cart
  async addToCart(userId, productId, quantity = 1) {
    const cart = await this.getCart(userId);
    
    return new Promise((resolve, reject) => {
      // Check if product already in cart
      db.get(
        `SELECT * FROM cart_items 
         WHERE cart_id = ? AND product_id = ?`,
        [cart.id, productId],
        (err, existingItem) => {
          if (err) return reject(err);
          
          if (existingItem) {
            // Update quantity if already exists
            db.run(
              `UPDATE cart_items 
               SET quantity = quantity + ?, updated_at = datetime('now')
               WHERE id = ?`,
              [quantity, existingItem.id],
              function(err) {
                if (err) return reject(err);
                resolve(this.changes > 0);
              }
            );
          } else {
            // Add new item
            db.run(
              `INSERT INTO cart_items (cart_id, product_id, quantity)
               VALUES (?, ?, ?)`,
              [cart.id, productId, quantity],
              function(err) {
                if (err) return reject(err);
                resolve(this.changes > 0);
              }
            );
          }
        }
      );
    });
  }

  // Remove item from cart
  async removeFromCart(userId, productId, removeAll = false) {
    const cart = await this.getCart(userId);
    
    return new Promise((resolve, reject) => {
      if (removeAll) {
        // Remove item completely
        db.run(
          `DELETE FROM cart_items 
           WHERE cart_id = ? AND product_id = ?`,
          [cart.id, productId],
          function(err) {
            if (err) return reject(err);
            resolve(this.changes > 0);
          }
        );
      } else {
        // Decrease quantity by 1
        db.run(
          `UPDATE cart_items 
           SET quantity = quantity - 1, updated_at = datetime('now')
           WHERE cart_id = ? AND product_id = ? AND quantity > 1`,
          [cart.id, productId],
          function(err) {
            if (err) return reject(err);
            if (this.changes === 0) {
              // If quantity was 1, remove the item
              this.removeFromCart(userId, productId, true)
                .then(resolve)
                .catch(reject);
            } else {
              resolve(true);
            }
          }
        );
      }
    });
  }

  // Clear cart
  async clearCart(userId) {
    const cart = await this.getCart(userId);
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM cart_items WHERE cart_id = ?`,
        [cart.id],
        function(err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }

  // Convert cart to order
  async checkoutCart(userId, paymentId) {
    const cart = await this.getCart(userId);
    const items = await this.getCartItems(cart.id);
    
    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(
          `INSERT INTO orders (user_id, payment_id, total_amount)
           VALUES (?, ?, ?)`,
          [userId, paymentId, total],
          function(err) {
            if (err) return reject(err);
            const orderId = this.lastID;

            // Add order items
            const stmt = db.prepare(
              `INSERT INTO order_items 
               (order_id, product_id, quantity, price_at_purchase)
               VALUES (?, ?, ?, ?)`
            );

            items.forEach(item => {
              stmt.run([orderId, item.product_id, item.quantity, item.price]);
            });

            stmt.finalize(err => {
              if (err) return reject(err);
              
              // Clear cart
              this.clearCart(userId)
                .then(() => resolve(orderId))
                .catch(reject);
            });
          }
        );
      });
    });
  }
}

export const cartService = new CartService();