import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import { menuService } from '../services/menuApi';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [availableIcons, setAvailableIcons] = useState([]);
  const [selectedRole, setSelectedRole] = useState('customer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, [selectedRole]);

  const fetchMenu = async () => {
    try {
      const [menu, icons] = await Promise.all([
        menuService.getMenu(selectedRole),
        menuService.getAvailableIcons()
      ]);
      setMenuItems(menu);
      setAvailableIcons(icons);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setMenuItems([
      ...menuItems,
      {
        text: 'New Item',
        command: 'new_command',
        icon: '📋',
        type: 'main'
      }
    ]);
  };

  const handleUpdateItem = (index, field, value) => {
    const updatedItems = [...menuItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setMenuItems(updatedItems);
  };

  const handleDeleteItem = (index) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await menuService.updateMenu(selectedRole, menuItems);
      alert('Menu saved successfully!');
    } catch (error) {
      console.error('Error saving menu:', error);
      alert('Failed to save menu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <div className="flex space-x-4">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="customer">Customer Menu</option>
              <option value="admin">Admin Menu</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
            >
              <FiSave className="mr-2" />
              Save Changes
            </motion.button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border rounded-lg p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text
                    </label>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleUpdateItem(index, 'text', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Command
                    </label>
                    <input
                      type="text"
                      value={item.command}
                      onChange={(e) => handleUpdateItem(index, 'command', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon
                    </label>
                    <select
                      value={item.icon}
                      onChange={(e) => handleUpdateItem(index, 'icon', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {availableIcons.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handleDeleteItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddItem}
            className="mt-6 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-md w-full flex items-center justify-center"
          >
            <FiPlus className="mr-2" />
            Add Menu Item
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;