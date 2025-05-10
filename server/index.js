// Add payment webhook endpoint
app.post('/api/payment-webhook', async (req, res) => {
  try {
    const signature = req.headers['x-nowpayments-sig'];
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    await paymentController.handlePaymentWebhook(req.body, signature);
    res.json({ success: true });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Add payment status check endpoint
app.get('/api/payments/:paymentId/status', async (req, res) => {
  try {
    const status = await paymentController.getPaymentStatus(req.params.paymentId);
    res.json(status);
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});