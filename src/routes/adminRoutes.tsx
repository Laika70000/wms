import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import LogisticianList from '../pages/admin/LogisticianList';
import ProtectedRoute from '../components/ProtectedRoute';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route 
        index
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="logisticians" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <LogisticianList />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AdminRoutes;