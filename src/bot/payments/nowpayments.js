import axios from 'axios';
import config from '../config.js';
import db from '../database.js';

class PaymentService {
  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.nowpayments.io/v1',
      headers: {
        'x-api-key': config.nowPaymentsApiKey,
        'Content-Type': 'application/json'
      }
    });
    this.supportedCurrencies = null;
  }

  async initialize() {
    try {
      const { data } = await this.api.get('/currencies');
      this.supportedCurrencies = data.currencies;
    } catch (error) {
      console.error('Failed to initialize payment service:', error.response?.data || error.message);
      throw new Error('Payment service initialization failed');
    }
  }

  async createPayment(userId, productId, amount) {
    try {
      const { data } = await this.api.post('/payment', {
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: 'btc',
        order_id: `${userId}_${productId}_${Date.now()}`,
        order_description: `Product ID: ${productId}`,
        ipn_callback_url: `${config.webhookUrl}/api/payment-webhook`,
        success_url: `https://t.me/${config.botUsername}`,
        cancel_url: `https://t.me/${config.botUsername}`
      });

      await this.savePayment(data, userId, productId);
      return data;
    } catch (error) {
      console.error('Payment creation failed:', error.response?.data || error.message);
      throw new Error('Failed to create payment');
    }
  }

  async savePayment(payment, userId, productId) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO payments (
          payment_id, user_id, product_id, status,
          pay_amount, pay_currency, price_amount,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          payment.payment_id,
          userId,
          productId,
          'pending',
          payment.pay_amount,
          payment.pay_currency,
          payment.price_amount
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getPaymentStatus(paymentId) {
    try {
      const { data } = await this.api.get(`/payment/${paymentId}`);
      return data;
    } catch (error) {
      console.error('Failed to get payment status:', error.response?.data || error.message);
      throw new Error('Payment status check failed');
    }
  }

  async updatePaymentStatus(paymentId, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE payments SET status = ?, updated_at = datetime("now") WHERE payment_id = ?',
        [status, paymentId],
        async (err) => {
          if (err) {
            reject(err);
            return;
          }

          if (status === 'finished' || status === 'confirmed') {
            try {
              await this.handleSuccessfulPayment(paymentId);
              resolve();
            } catch (error) {
              reject(error);
            }
          } else {
            resolve();
          }
        }
      );
    });
  }

  async handleSuccessfulPayment(paymentId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT product_id, user_id FROM payments WHERE payment_id = ?',
        [paymentId],
        async (err, payment) => {
          if (err) {
            reject(err);
            return;
          }

          // Update product stock
          db.run(
            'UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0',
            [payment.product_id],
            (err) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(payment);
            }
          );
        }
      );
    });
  }

  verifyIPNSignature(payload, signature) {
    // Implement signature verification based on NOWPayments documentation
    // This is a placeholder - implement actual verification logic
    return true;
  }
}

export const paymentService = new PaymentService();