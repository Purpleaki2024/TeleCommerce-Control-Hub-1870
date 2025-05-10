@echo off
echo Updating Telegram Shop Bot...

REM Stop the application
call pm2 stop telegram-shop-bot

REM Backup the database
node deployment/backup.js

REM Pull latest changes (if using Git)
REM git pull

REM Install dependencies
call npm install --production

REM Restart the application
call pm2 restart telegram-shop-bot

echo Update complete!
pause