import dotenv from 'dotenv';
dotenv.config();

export default {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  nowPaymentsApiKey: process.env.NOWPAYMENTS_API_KEY,
  nowPaymentsIpnSecret: process.env.NOWPAYMENTS_IPN_SECRET,
  webhookUrl: process.env.WEBHOOK_URL,
  botUsername: process.env.BOT_USERNAME,
  adminIds: process.env.ADMIN_IDS?.split(',').map(id => Number(id)) || [],
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key'
};