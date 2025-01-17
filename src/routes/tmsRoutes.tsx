import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import ShipmentList from '../pages/tms/ShipmentList';
import ShipmentDetail from '../pages/tms/ShipmentDetail';
import CarrierList from '../pages/tms/CarrierList';
import CarrierDetail from '../pages/tms/CarrierDetail';
import CarrierSettings from '../pages/tms/CarrierSettings';
import RateList from '../pages/tms/RateList';
import RuleList from '../pages/tms/RuleList';

const TMSRoutes = () => {
  return (
    <Routes>
      {/* Route principale - Liste des expéditions */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute allowedRoles={['logistician']}>
            <ShipmentList />
          </ProtectedRoute>
        } 
      />

      {/* Détail d'une expédition */}
      <Route 
        path="/shipments/:id" 
        element={
          <ProtectedRoute allowedRoles={['logistician', 'merchant']}>
            <ShipmentDetail />
          </ProtectedRoute>
        } 
      />

      {/* Gestion des transporteurs */}
      <Route 
        path="/carriers" 
        element={
          <ProtectedRoute allowedRoles={['logistician']}>
            <CarrierList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/carriers/:id" 
        element={
          <ProtectedRoute allowedRoles={['logistician']}>
            <CarrierDetail />
          </ProtectedRoute>
        } 
      />

      {/* Paramètres des transporteurs */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute allowedRoles={['logistician']}>
            <CarrierSettings />
          </ProtectedRoute>
        } 
      />

      {/* Gestion des tarifs */}
      <Route 
        path="/rates" 
        element={
          <ProtectedRoute allowedRoles={['logistician']}>
            <RateList />
          </ProtectedRoute>
        } 
      />

      {/* Gestion des règles d'allocation */}
      <Route 
        path="/rules" 
        element={
          <ProtectedRoute allowedRoles={['logistician']}>
            <RuleList />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default TMSRoutes;