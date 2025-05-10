import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiMenu, FiShoppingBag, FiUsers, FiSettings } from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/inventory')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <FiPackage className="text-2xl text-indigo-600 mr-4" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">Inventory</h3>
              <p className="text-sm text-gray-500">Manage products and stock</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/menu')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <FiMenu className="text-2xl text-indigo-600 mr-4" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
              <p className="text-sm text-gray-500">Configure bot menus</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/orders')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <FiShoppingBag className="text-2xl text-indigo-600 mr-4" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
              <p className="text-sm text-gray-500">View and manage orders</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/customers')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <FiUsers className="text-2xl text-indigo-600 mr-4" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
              <p className="text-sm text-gray-500">Customer management</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/settings')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <FiSettings className="text-2xl text-indigo-600 mr-4" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              <p className="text-sm text-gray-500">Bot configuration</p>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;