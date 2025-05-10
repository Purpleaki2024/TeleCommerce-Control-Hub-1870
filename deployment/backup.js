import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { format } from 'date-fns';

const backupDir = path.join(process.cwd(), 'backups');
const dbPath = path.join(process.cwd(), 'shop.db');
const maxBackups = 7; // Keep a week of backups

async function createBackup() {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm');
  const backupPath = path.join(backupDir, `shop-${timestamp}.db`);

  try {
    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    // Copy database file
    await fs.copyFile(dbPath, backupPath);
    console.log(`Backup created: ${backupPath}`);

    // Clean old backups
    const files = await fs.readdir(backupDir);
    const backups = files.filter(f => f.startsWith('shop-') && f.endsWith('.db'))
      .sort().reverse();

    // Remove old backups keeping only maxBackups
    for (const backup of backups.slice(maxBackups)) {
      await fs.unlink(path.join(backupDir, backup));
      console.log(`Removed old backup: ${backup}`);
    }
  } catch (error) {
    console.error('Backup failed:', error);
  }
}

// Run backup
createBackup();