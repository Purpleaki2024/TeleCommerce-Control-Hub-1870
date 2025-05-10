import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import InventoryManagement from './components/InventoryManagement';
import OrderManagement from './components/OrderManagement';
import ProtectedRoute from './routes/ProtectedRoute';
import './App.css';

function App() {
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
        <Route path="/admin/orders" element={
          <ProtectedRoute>
            <OrderManagement />
          </ProtectedRoute>
        } />
        <Route path="/" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App;