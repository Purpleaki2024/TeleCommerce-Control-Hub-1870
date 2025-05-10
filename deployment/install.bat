@echo off
echo Installing Telegram Shop Bot...

REM Install Node.js dependencies
call npm install --production

REM Install PM2 globally
call npm install -g pm2

REM Create required directories
mkdir logs
mkdir backups

REM Set up environment variables
copy .env.example .env

REM Install PM2 as a Windows service
call pm2 install pm2-windows-service

REM Start the application
call pm2 start deployment/pm2.config.js

REM Save PM2 process list
call pm2 save

REM Set up scheduled tasks
schtasks /create /tn "TelegramShopBackup" /tr "node %CD%\deployment\backup.js" /sc daily /st 00:00
schtasks /create /tn "TelegramShopMonitor" /tr "node %CD%\deployment\monitor.js" /sc minute /mo 5

echo Installation complete!
echo Please update the .env file with your configuration
pause