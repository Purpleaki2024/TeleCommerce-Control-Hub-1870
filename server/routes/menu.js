import express from 'express';
import { db, dbAsync } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;
    const row = await dbAsync.get(
      `SELECT menu_structure FROM menu_config WHERE role = ?`,
      [role]
    );
    res.json(row ? JSON.parse(row.menu_structure) : []);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { role, menuItems, menuStructure } = req.body;
    const result = await dbAsync.run(
      `INSERT OR REPLACE INTO menu_config 
       (role, menu_items, menu_structure) 
       VALUES (?, ?, ?)`,
      [role, JSON.stringify(menuItems), JSON.stringify(menuStructure)]
    );
    res.json({ success: true, changes: result.changes });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ error: 'Failed to update menu' });
  }
});

export default router;