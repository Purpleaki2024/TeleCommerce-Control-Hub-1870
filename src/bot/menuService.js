import { db, dbAsync } from './database.js';

class MenuService {
  async getMenu(role = 'customer') {
    try {
      const row = await dbAsync.get(
        `SELECT menu_structure FROM menu_config WHERE role = ?`,
        [role]
      );
      return row ? JSON.parse(row.menu_structure) : [];
    } catch (error) {
      console.error('Error fetching menu:', error);
      return [];
    }
  }

  async updateMenu(role, menuItems, menuStructure) {
    try {
      const result = await dbAsync.run(
        `INSERT OR REPLACE INTO menu_config 
         (role, menu_items, menu_structure) 
         VALUES (?, ?, ?)`,
        [role, JSON.stringify(menuItems), JSON.stringify(menuStructure)]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating menu:', error);
      return false;
    }
  }

  // ... rest of the class implementation remains the same ...
}

export const menuService = new MenuService();