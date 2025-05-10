// Create a new client-side API service
import axios from 'axios';

class MenuService {
  async getMenu(role = 'customer') {
    try {
      const { data } = await axios.get(`/api/menu/${role}`);
      return data;
    } catch (error) {
      console.error('Error fetching menu:', error);
      return [];
    }
  }

  async updateMenu(role, menuItems, menuStructure) {
    try {
      const { data } = await axios.post('/api/menu', {
        role,
        menuItems,
        menuStructure
      });
      return data;
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
      // ... rest of the menu items ...
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