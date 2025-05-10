# Telegram Shop Bot - Windows VPS Deployment

## System Requirements

- Windows Server 2016 or later
- Node.js 16+ LTS
- 2GB RAM minimum
- 20GB disk space minimum

## Installation

1. Copy all files to your deployment directory

2. Run the installation script:
```batch
deployment\install.bat
```

3. Configure environment variables in `.env`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
NOWPAYMENTS_API_KEY=your_api_key
NOWPAYMENTS_IPN_SECRET=your_ipn_secret
WEBHOOK_URL=https://your-domain.com
BOT_USERNAME=your_bot_username
ADMIN_IDS=123456,789012
JWT_SECRET=your_secure_secret
```

## Monitoring

The system includes:

- Automatic process management (PM2)
- Daily database backups
- System resource monitoring
- Warning notifications
- Log rotation

Monitor logs are stored in:
- `logs/error.log` - Error logs
- `logs/output.log` - Standard output
- `logs/monitor/` - System monitoring reports
- `logs/warnings.log` - System warnings

## Backup System

Backups are stored in `backups/` directory:
- Daily automatic backups
- Keeps last 7 days of backups
- Manual backup possible via:
```batch
node deployment\backup.js
```

## Updating

To update the application:
```batch
deployment\update.bat
```

## Common Tasks

### View logs:
```batch
pm2 logs telegram-shop-bot
```

### Restart application:
```batch
pm2 restart telegram-shop-bot
```

### Monitor resources:
```batch
pm2 monit
```

### View monitoring report:
```batch
type logs\monitor\monitor-YYYY-MM-DD.json
```

## Troubleshooting

1. If the bot fails to start:
   - Check logs in `logs/error.log`
   - Verify environment variables
   - Ensure ports are not blocked

2. If backups fail:
   - Check disk space
   - Verify backup directory permissions
   - Check logs for errors

3. Memory issues:
   - Monitor memory usage in logs
   - Adjust `max_memory_restart` in pm2.config.js
   - Consider upgrading VPS resources

## Security Notes

- Keep `.env` file secure
- Regular system updates
- Monitor warning logs
- Use strong JWT_SECRET
- Configure Windows Firewall
- Regular security audits

## Support

For issues:
1. Check logs in `logs/` directory
2. Review monitoring reports
3. Contact support with log files

Remember to:
- Regularly check monitoring reports
- Keep system updated
- Monitor disk space
- Review security settings