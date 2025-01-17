import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SourceProvider } from './contexts/SourceContext';
import { MerchantProvider } from './contexts/MerchantContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layouts
import AppLayout from './layouts/AppLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';
import MerchantSignup from './pages/auth/MerchantSignup';
import ProtectedRoute from './components/ProtectedRoute';

// Routes
import OrderRoutes from './routes/orderRoutes';
import AdminRoutes from './routes/adminRoutes';
import MerchantRoutes from './routes/merchantRoutes';
import TMSRoutes from './routes/tmsRoutes';

// Pages
import Dashboard from './pages/Dashboard';
import Inventory from './pages/inventory/InventoryList';
import ProductDetail from './pages/inventory/ProductDetail';
import OrderPreparation from './pages/picking/PickingList';
import BatchDetail from './pages/picking/BatchDetail';
import Locations from './pages/locations/LocationList';
import Reports from './pages/reports/ReportList';
import Settings from './pages/settings/Settings';
import Sources from './pages/settings/Sources';
import Merchants from './pages/settings/Merchants';
import BlankPage from './pages/BlankPage';

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SourceProvider>
          <MerchantProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup/merchant" element={<MerchantSignup />} />
                
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/blank" element={<BlankPage />} />
                  
                  {/* Routes Logisticien */}
                  <Route
                    path="/inventory"
                    element={<ProtectedRoute allowedRoles={['logistician']}><Inventory /></ProtectedRoute>}
                  />
                  <Route
                    path="/inventory/:id"
                    element={<ProtectedRoute allowedRoles={['logistician']}><ProductDetail /></ProtectedRoute>}
                  />
                  
                  <Route path="/orders/*" element={<OrderRoutes />} />
                  
                  <Route path="/admin/*" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminRoutes />
                    </ProtectedRoute>
                  } />

                  {/* Routes Marchand */}
                  <Route path="/merchant/*" element={
                    <ProtectedRoute allowedRoles={['merchant']}>
                      <MerchantRoutes />
                    </ProtectedRoute>
                  } />

                  {/* Routes TMS */}
                  <Route path="/tms/*" element={
                    <ProtectedRoute allowedRoles={['logistician']}>
                      <TMSRoutes />
                    </ProtectedRoute>
                  } />
                  
                  <Route
                    path="/picking"
                    element={<ProtectedRoute allowedRoles={['logistician']}><OrderPreparation /></ProtectedRoute>}
                  />
                  <Route
                    path="/picking/batch/:batchId"
                    element={<ProtectedRoute allowedRoles={['logistician']}><BatchDetail /></ProtectedRoute>}
                  />
                  
                  <Route
                    path="/locations"
                    element={<ProtectedRoute allowedRoles={['logistician']}><Locations /></ProtectedRoute>}
                  />
                  
                  <Route path="/reports" element={<Reports />} />
                  
                  <Route path="/settings" element={<Settings />} />
                  <Route
                    path="/settings/sources"
                    element={<ProtectedRoute allowedRoles={['merchant']}><Sources /></ProtectedRoute>}
                  />
                  <Route
                    path="/settings/merchants"
                    element={<ProtectedRoute allowedRoles={['logistician']}><Merchants /></ProtectedRoute>}
                  />
                </Route>
              </Routes>
            </Router>
            <Toaster position="top-right" />
          </MerchantProvider>
        </SourceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;