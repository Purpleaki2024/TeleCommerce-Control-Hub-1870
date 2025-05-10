// Update payment service with enhanced security and validation
class PaymentService {
  constructor() {
    // ... existing constructor ...

    // Add additional validation
    this.requiredFields = ['price_amount', 'price_currency', 'pay_currency'];
    this.allowedCurrencies = ['USD', 'EUR', 'BTC', 'ETH', 'USDT'];
  }

  validatePaymentData(data) {
    // Check required fields
    for (const field of this.requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate currency
    if (!this.allowedCurrencies.includes(data.price_currency)) {
      throw new Error('Invalid price currency');
    }

    // Validate amount
    if (isNaN(data.price_amount) || data.price_amount <= 0) {
      throw new Error('Invalid price amount');
    }

    return true;
  }

  async createPayment(userId, orderId, amount) {
    const paymentData = {
      price_amount: amount,
      price_currency: 'USD',
      pay_currency: 'BTC',
      order_id: `${userId}_${orderId}_${Date.now()}`,
      order_description: `Order ID: ${orderId}`,
      ipn_callback_url: `${config.webhookUrl}/api/payment-webhook`,
      success_url: `https://t.me/${config.botUsername}`,
      cancel_url: `https://t.me/${config.botUsername}`
    };

    try {
      this.validatePaymentData(paymentData);
      const { data } = await this.api.post('/payment', paymentData);
      await this.savePayment(data, userId, orderId);
      return data;
    } catch (error) {
      console.error('Payment creation failed:', error.response?.data || error.message);
      throw new Error('Failed to create payment');
    }
  }

  verifyIPNSignature(payload, signature) {
    try {
      const crypto = require('crypto');
      const sortedPayload = Object.keys(payload)
        .sort()
        .reduce((acc, key) => {
          acc[key] = payload[key];
          return acc;
        }, {});
      
      const hmac = crypto.createHmac('sha512', config.nowPaymentsIpnSecret);
      const calculatedSignature = hmac
        .update(JSON.stringify(sortedPayload))
        .digest('hex');
      
      return signature === calculatedSignature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  // ... rest of the existing methods ...
}

export const paymentService = new PaymentService();