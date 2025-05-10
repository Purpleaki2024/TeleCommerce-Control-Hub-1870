import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
        fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Store Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Products Overview</h2>
            <div className="space-y-4">
              {products.map(product => (
                <div key={product.id} className="border p-4 rounded">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <p className="text-sm">Price: ${product.price}</p>
                  <p className="text-sm">Stock: {product.stock}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${order.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;</QustAction>

<QuestAction type="file" filePath="src/App.jsx">
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import InventoryManagement from './components/InventoryManagement';
import ProtectedRoute from './routes/ProtectedRoute';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/inventory" element={
          <ProtectedRoute>
            <InventoryManagement />
          </ProtectedRoute>
        } />
        <Route path="/" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
};

export default App;