import React from 'react';
import { Settings as SettingsIcon, Store, User, Bell, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const isMerchant = user?.role === 'merchant';
  const isLogistician = user?.role === 'logistician';

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Paramètres</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isMerchant && (
          <Link 
            to="/settings/sources"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <Store className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold">Sources e-commerce</h2>
            </div>
            <p className="text-gray-600">
              Gérez vos connexions Shopify et Amazon pour synchroniser vos commandes.
            </p>
          </Link>
        )}

        {isLogistician && (
          <Link 
            to="/settings/merchants"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold">Marchands</h2>
            </div>
            <p className="text-gray-600">
              Gérez les comptes marchands et leurs connexions e-commerce.
            </p>
          </Link>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold">Profil</h2>
          </div>
          <p className="text-gray-600">
            Gérez vos informations personnelles et vos préférences.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <p className="text-gray-600">
            Configurez vos préférences de notifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;