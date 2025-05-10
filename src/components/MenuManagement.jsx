import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiSave, FiPlus, FiX, FiChevronDown, FiChevronUp, FiChevronRight } from 'react-icons/fi';
import { menuService } from '../bot/menuService';

const MenuManagement = () => {
  const [customerMenu, setCustomerMenu] = useState([]);
  const [adminMenu, setAdminMenu] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [availableIcons, setAvailableIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('customer');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const [customerItems, adminItems, available, icons] = await Promise.all([
          menuService.getMenu('customer'),
          menuService.getMenu('admin'),
          menuService.getAvailableMenuItems(),
          menuService.getAvailableIcons()
        ]);
        
        setCustomerMenu(customerItems);
        setAdminMenu(adminItems);
        setAvailableItems(available);
        setAvailableIcons(icons);
      } catch (error) {
        console.error('Error fetching menus:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const toggleExpand = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await Promise.all([
        menuService.updateMenu(
          'customer', 
          customerMenu.map(item => item.text),
          customerMenu
        ),
        menuService.updateMenu(
          'admin',
          adminMenu.map(item => item.text),
          adminMenu
        )
      ]);
      alert('Menu configurations saved successfully!');
    } catch (error) {
      console.error('Error saving menus:', error);
      alert('Failed to save menu configurations');
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = (item) => {
    const newItem = {
      text: item.text,
      command: item.command,
      icon: item.icon,
      submenu: []
    };

    if (activeTab === 'customer') {
      setCustomerMenu([...customerMenu, newItem]);
    } else {
      setAdminMenu([...adminMenu, newItem]);
    }
    setShowAddModal(false);
  };

  const removeMenuItem = (index) => {
    if (activeTab === 'customer') {
      setCustomerMenu(customerMenu.filter((_, i) => i !== index));
    } else {
      setAdminMenu(adminMenu.filter((_, i) => i !== index));
    }
  };

  const addSubmenuItem = (parentIndex, item) => {
    const newSubItem = {
      text: item.text,
      command: item.command
    };

    if (activeTab === 'customer') {
      const updated = [...customerMenu];
      if (!updated[parentIndex].submenu) {
        updated[parentIndex].submenu = [];
      }
      updated[parentIndex].submenu.push(newSubItem);
      setCustomerMenu(updated);
    } else {
      const updated = [...adminMenu];
      if (!updated[parentIndex].submenu) {
        updated[parentIndex].submenu = [];
      }
      updated[parentIndex].submenu.push(newSubItem);
      setAdminMenu(updated);
    }
    setShowAddModal(false);
  };

  const removeSubmenuItem = (parentIndex, subIndex) => {
    if (activeTab === 'customer') {
      const updated = [...customerMenu];
      updated[parentIndex].submenu = updated[parentIndex].submenu.filter((_, i) => i !== subIndex);
      setCustomerMenu(updated);
    } else {
      const updated = [...adminMenu];
      updated[parentIndex].submenu = updated[parentIndex].submenu.filter((_, i) => i !== subIndex);
      setAdminMenu(updated);
    }
  };

  const updateItemIcon = (index, icon) => {
    if (activeTab === 'customer') {
      const updated = [...customerMenu];
      updated[index].icon = icon;
      setCustomerMenu(updated);
    } else {
      const updated = [...adminMenu];
      updated[index].icon = icon;
      setAdminMenu(updated);
    }
    setShowIconPicker(false);
  };

  const moveItem = (index, direction) => {
    const menu = activeTab === 'customer' ? [...customerMenu] : [...adminMenu];
    
    if (direction === 'up' && index > 0) {
      [menu[index], menu[index - 1]] = [menu[index - 1], menu[index]];
    } else if (direction === 'down' && index < menu.length - 1) {
      [menu[index], menu[index + 1]] = [menu[index + 1], menu[index]];
    }

    if (activeTab === 'customer') {
      setCustomerMenu(menu);
    } else {
      setAdminMenu(menu);
    }
  };

  const moveSubmenuItem = (parentIndex, subIndex, direction) => {
    const menu = activeTab === 'customer' ? [...customerMenu] : [...adminMenu];
    const submenu = [...menu[parentIndex].submenu];
    
    if (direction === 'up' && subIndex > 0) {
      [submenu[subIndex], submenu[subIndex - 1]] = [submenu[subIndex - 1], submenu[subIndex]];
    } else if (direction === 'down' && subIndex < submenu.length - 1) {
      [submenu[subIndex], submenu[subIndex + 1]] = [submenu[subIndex + 1], submenu[subIndex]];
    }

    menu[parentIndex].submenu = submenu;

    if (activeTab === 'customer') {
      setCustomerMenu(menu);
    } else {
      setAdminMenu(menu);
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

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('customer')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'customer' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Customer Menu
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'admin' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Admin Menu
              </button>
            </nav>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">
                {activeTab === 'customer' ? 'Customer' : 'Admin'} Menu Items
              </h2>
              
              <div className="space-y-3">
                {(activeTab === 'customer' ? customerMenu : adminMenu).map((item, index) => (
                  <div key={index} className="space-y-2">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            setShowIconPicker(true);
                            setEditingItem({ index, type: 'main' });
                          }}
                          className="w-8 h-8 flex items-center justify-center mr-3 bg-white rounded border"
                        >
                          {item.icon || '?'}
                        </button>
                        <span>{item.text}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        {item.submenu && (
                          <button
                            onClick={() => toggleExpand(index)}
                            className="text-gray-500 hover:text-indigo-600"
                          >
                            {expandedItems[index] ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                        )}
                        <button
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                          className="text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === (activeTab === 'customer' ? customerMenu : adminMenu).length - 1}
                          className="text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem({ index, type: 'submenu' });
                            setShowAddModal(true);
                          }}
                          className="text-gray-500 hover:text-green-600"
                        >
                          <FiPlus />
                        </button>
                        <button
                          onClick={() => removeMenuItem(index)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <FiX />
                        </button>
                      </div>
                    </motion.div>

                    {expandedItems[index] && item.submenu && (
                      <div className="ml-8 space-y-2">
                        {item.submenu.map((subItem, subIndex) => (
                          <motion.div
                            key={subIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-2 pl-4 bg-gray-100 rounded-lg"
                          >
                            <div className="flex items-center">
                              <FiChevronRight className="text-gray-400 mr-3" />
                              <span>{subItem.text}</span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => moveSubmenuItem(index, subIndex, 'up')}
                                disabled={subIndex === 0}
                                className="text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moveSubmenuItem(index, subIndex, 'down')}
                                disabled={subIndex === item.submenu.length - 1}
                                className="text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => removeSubmenuItem(index, subIndex)}
                                className="text-gray-500 hover:text-red-600"
                              >
                                <FiX />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {activeTab === 'customer' && customerMenu.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No menu items configured for customers
                </div>
              )}

              {activeTab === 'admin' && adminMenu.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No menu items configured for admins
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingItem(null);
                setShowAddModal(true);
              }}
              className="w-full py-2 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-400"
            >
              <FiPlus className="mr-2" />
              Add Menu Item
            </motion.button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingItem?.type === 'submenu' ? 'Add Submenu Item' : 'Add Menu Item'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {availableItems
                .filter(item => {
                  if (activeTab === 'customer' && item.type === 'admin') return false;
                  if (activeTab === 'admin' && item.type === 'main') return false;
                  
                  if (editingItem?.type === 'submenu') {
                    const parent = activeTab === 'customer' ? 
                      customerMenu[editingItem.index] : 
                      adminMenu[editingItem.index];
                    return !parent.submenu?.some(sub => sub.text === item.text);
                  } else {
                    const currentMenu = activeTab === 'customer' ? 
                      customerMenu : adminMenu;
                    return !currentMenu.some(menu => menu.text === item.text);
                  }
                })
                .map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      if (editingItem?.type === 'submenu') {
                        addSubmenuItem(editingItem.index, item);
                      } else {
                        addMenuItem(item);
                      }
                    }}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    {item.text}
                  </motion.div>
                ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showIconPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Select Icon</h2>
              <button
                onClick={() => setShowIconPicker(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX />
              </button>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {availableIcons.map((icon, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateItemIcon(editingItem.index, icon)}
                  className="text-2xl p-2 hover:bg-gray-100 rounded"
                >
                  {icon}
                </motion.button>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowIconPicker(false)}
                className="w-full py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;