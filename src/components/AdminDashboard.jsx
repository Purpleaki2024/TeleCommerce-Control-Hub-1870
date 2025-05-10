import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiUsers, FiDollarSign, FiShoppingCart, FiList, FiBarChart } from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Sales</p>
                <h3 className="text-2xl font-bold">$12,426</h3>
              </div>
              <FiDollarSign className="text-green-500 text-2xl" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Active Users</p>
                <h3 className="text-2xl font-bold">243</h3>
              </div>
              <FiUsers className="text-blue-500 text-2xl" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Orders</p>
                <h3 className="text-2xl font-bold">56</h3>
              </div>
              <FiShoppingCart className="text-purple-500 text-2xl" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Products</p>
                <h3 className="text-2xl font-bold">15</h3>
              </div>
              <FiPackage className="text-orange-500 text-2xl" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/inventory')}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <FiPackage className="mr-2" />
                Manage Inventory
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/orders')}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <FiShoppingCart className="mr-2" />
                View Orders
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/users')}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <FiUsers className="mr-2" />
                Manage Users
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/analytics')}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <FiBarChart className="mr-2" />
                Analytics
              </motion.button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Management</h2>
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/orders')}
                className="w-full p-3 bg-indigo-50 rounded-lg flex items-center text-indigo-700 hover:bg-indigo-100"
              >
                <FiList className="mr-2" />
                View All Orders
              </motion.button>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/admin/orders?status=pending')}
                  className="p-3 bg-yellow-50 rounded-lg flex items-center text-yellow-700 hover:bg-yellow-100"
                >
                  <FiShoppingCart className="mr-2" />
                  Pending
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/admin/orders?status=completed')}
                  className="p-3 bg-green-50 rounded-lg flex items-center text-green-700 hover:bg-green-100"
                >
                  <FiDollarSign className="mr-2" />
                  Completed
                </motion.button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center">
                  <FiShoppingCart className="text-purple-500 mr-3" />
                  <div>
                    <p className="font-medium">New Order #1234</p>
                    <p className="text-sm text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-500">$124.00</span>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center">
                  <FiUsers className="text-blue-500 mr-3" />
                  <div>
                    <p className="font-medium">New User Registration</p>
                    <p className="text-sm text-gray-500">15 minutes ago</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center">
                  <FiPackage className="text-orange-500 mr-3" />
                  <div>
                    <p className="font-medium">Product Stock Update</p>
                    <p className="text-sm text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-blue-500">+50 units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;