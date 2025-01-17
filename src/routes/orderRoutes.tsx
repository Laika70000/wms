import React from 'react';
import { Route, Routes } from 'react-router-dom';
import OrderList from '../pages/orders/OrderList';
import OrderDetail from '../pages/orders/OrderDetail';
import ProtectedRoute from '../components/ProtectedRoute';

const OrderRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <OrderList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/:id" 
        element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default OrderRoutes;