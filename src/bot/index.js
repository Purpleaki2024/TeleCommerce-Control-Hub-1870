// Add to the top of the file
import { initNotificationService } from './notificationService.js';

// Initialize notification service after bot creation
const bot = new TelegramBot(token, { polling: true });
initNotificationService(bot);

// ... rest of the existing code ...