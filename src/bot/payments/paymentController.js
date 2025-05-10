import { dbAsync } from '../database.js';
import { paymentService } from './nowpayments.js';
import { notificationService } from '../notificationService.js';

export const paymentController = {
  async createPayment(userId, orderId, amount) {
    try {
      const payment = await paymentService.createPayment(userId, orderId, amount);
      
      // Log payment creation
      await dbAsync.run(
        `INSERT INTO payment_logs (payment_id, user_id, order_id, amount, status, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        [payment.payment_id, userId, orderId, amount, 'created']
      );
      
      return payment;
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw new Error('Failed to create payment');
    }
  },

  async handlePaymentWebhook(payload, signature) {
    try {
      if (!paymentService.verifyIPNSignature(payload, signature)) {
        throw new Error('Invalid IPN signature');
      }

      const { payment_id, payment_status, order_id } = payload;

      // Update payment status
      await dbAsync.run(
        `UPDATE payments 
         SET status = ?, updated_at = datetime('now')
         WHERE payment_id = ?`,
        [payment_status, payment_id]
      );

      // Log webhook receipt
      await dbAsync.run(
        `INSERT INTO payment_logs (payment_id, status, webhook_data, created_at)
         VALUES (?, ?, ?, datetime('now'))`,
        [payment_id, payment_status, JSON.stringify(payload)]
      );

      if (payment_status === 'finished' || payment_status === 'confirmed') {
        await this.handleSuccessfulPayment(payment_id, order_id);
      }

      return true;
    } catch (error) {
      console.error('Webhook processing failed:', error);
      throw new Error('Failed to process payment webhook');
    }
  },

  async handleSuccessfulPayment(paymentId, orderId) {
    try {
      // Get payment details
      const payment = await dbAsync.get(
        'SELECT user_id, order_id FROM payments WHERE payment_id = ?',
        [paymentId]
      );

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update order status
      await dbAsync.run(
        `UPDATE orders 
         SET status = 'paid', updated_at = datetime('now')
         WHERE id = ?`,
        [orderId]
      );

      // Send notification to user
      await notificationService.sendOrderNotification(
        payment.user_id,
        { id: orderId, status: 'paid' }
      );

      return true;
    } catch (error) {
      console.error('Error handling successful payment:', error);
      throw new Error('Failed to process successful payment');
    }
  },

  async getPaymentStatus(paymentId) {
    try {
      const status = await paymentService.getPaymentStatus(paymentId);
      return status;
    } catch (error) {
      console.error('Payment status check failed:', error);
      throw new Error('Failed to check payment status');
    }
  }
};