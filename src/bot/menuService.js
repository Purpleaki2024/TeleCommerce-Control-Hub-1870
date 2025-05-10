import { dbAsync } from './database.js';

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

  async getAvailableMenuItems() {
    return [
      { 
        text: '🛍️ Products', 
        command: 'products',
        icon: '🛍️',
        type: 'main'
      },
      { 
        text: '🛒 Cart', 
        command: 'cart',
        icon: '🛒',
        type: 'main'
      },
      { 
        text: '📋 Orders', 
        command: 'orders',
        icon: '📋',
        type: 'main'
      },
      { 
        text: 'ℹ️ Help', 
        command: 'help',
        icon: 'ℹ️',
        type: 'main'
      },
      { 
        text: '📊 Dashboard', 
        command: 'dashboard',
        icon: '📊',
        type: 'admin'
      },
      { 
        text: '📦 Orders', 
        command: 'admin_orders',
        icon: '📦',
        type: 'admin'
      },
      { 
        text: '📋 Inventory', 
        command: 'inventory',
        icon: '📋',
        type: 'admin'
      },
      { 
        text: '👥 Users', 
        command: 'users',
        icon: '👥',
        type: 'admin'
      },
      { 
        text: '⚙️ Settings', 
        command: 'settings',
        icon: '⚙️',
        type: 'admin'
      },
      { 
        text: '👤 Account', 
        command: 'account',
        icon: '👤',
        type: 'main'
      }
    ];
  }

  async getAvailableIcons() {
    return [
      '🛍️', '🛒', '📋', 'ℹ️', '📊', '📦', '👥', '⚙️', '👤',
      '💰', '🔔', '📦', '🚚', '✅', '❌', '🔍', '➕', '➖',
      '🔧', '🔒', '📁', '📂', '📅', '⏰', '⭐', '🎁', '🏷️'
    ];
  }
}

export const menuService = new MenuService();