import React from 'react';
import { Package, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const isLogistician = user?.role === 'logistician';

  const stats = [
    { 
      icon: <Package className="w-6 h-6 text-blue-500" />, 
      label: 'Total Produits', 
      value: '1,234',
      description: 'Produits en stock'
    },
    { 
      icon: <TrendingUp className="w-6 h-6 text-green-500" />, 
      label: 'Commandes Actives', 
      value: '56',
      description: 'En cours de traitement'
    },
    { 
      icon: <Clock className="w-6 h-6 text-orange-500" />, 
      label: 'À Expédier', 
      value: '23',
      description: 'Commandes prêtes'
    },
    { 
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />, 
      label: 'Stock Faible', 
      value: '15',
      description: 'Produits à réapprovisionner'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Bonjour, {user?.name}
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de votre activité
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-full">
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLogistician && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Commandes Urgentes</h2>
            <div className="space-y-4">
              {/* Liste des commandes urgentes à implémenter */}
              <p className="text-gray-600">Aucune commande urgente</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Stock à Réapprovisionner</h2>
            <div className="space-y-4">
              {/* Liste des produits à réapprovisionner à implémenter */}
              <p className="text-gray-600">Aucun produit à réapprovisionner</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;