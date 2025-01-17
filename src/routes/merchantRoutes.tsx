import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductCatalog from '../pages/merchant/ProductCatalog';
import StockManagement from '../pages/merchant/StockManagement';
import ProtectedRoute from '../components/ProtectedRoute';

const MerchantRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute allowedRoles={['merchant']}>
            <ProductCatalog />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/stock" 
        element={
          <ProtectedRoute allowedRoles={['merchant']}>
            <StockManagement />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default MerchantRoutes;