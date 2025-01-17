import React, { useState } from 'react';
import { Package, ShoppingCart, Map, BarChart3, Settings, LogOut, ClipboardList, Users, Boxes, Truck, ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [transportOpen, setTransportOpen] = useState(false);

  const navItems = [
    // Routes Admin
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Logisticiens',
      path: '/admin/logisticians',
      roles: ['admin']
    },
    // Routes Marchand
    {
      icon: <Package className="w-5 h-5" />,
      label: 'Catalogue',
      path: '/merchant',
      roles: ['merchant']
    },
    {
      icon: <Boxes className="w-5 h-5" />,
      label: 'Stocks',
      path: '/merchant/stock',
      roles: ['merchant']
    },
    // Routes Logisticien
    { 
      icon: <Package className="w-5 h-5" />, 
      label: 'Inventaire', 
      path: '/inventory',
      roles: ['logistician']
    },
    { 
      icon: <ShoppingCart className="w-5 h-5" />, 
      label: 'Commandes', 
      path: '/orders',
      roles: ['logistician', 'merchant']
    },
    { 
      icon: <ClipboardList className="w-5 h-5" />, 
      label: 'Préparation', 
      path: '/picking',
      roles: ['logistician']
    },
    { 
      icon: <Map className="w-5 h-5" />, 
      label: 'Emplacements', 
      path: '/locations',
      roles: ['logistician']
    },
    // Menu Transport avec sous-menus
    {
      icon: <Truck className="w-5 h-5" />,
      label: 'Transport',
      roles: ['logistician'],
      submenu: [
        { label: 'Expéditions', path: '/tms' },
        { label: 'Transporteurs', path: '/tms/carriers' },
        { label: 'Tarifs', path: '/tms/rates' },
        { label: 'Règles', path: '/tms/rules' },
        { label: 'Paramètres transporteur', path: '/tms/settings' }
      ]
    },
    { 
      icon: <BarChart3 className="w-5 h-5" />, 
      label: 'Rapports', 
      path: '/reports',
      roles: ['logistician', 'merchant']
    },
    { 
      icon: <Settings className="w-5 h-5" />, 
      label: 'Paramètres', 
      path: '/settings',
      roles: ['logistician', 'merchant', 'admin']
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(
    item => item.roles.includes(user?.role || '')
  );

  return (
    <div className="w-64 bg-gray-900 min-h-screen p-4 text-white flex flex-col">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <Package className="w-8 h-8" />
        <h1 className="text-xl font-bold">WMS System</h1>
      </Link>
      
      <div className="mb-6 px-4">
        <p className="text-sm text-gray-400">Connecté en tant que</p>
        <p className="font-medium">{user?.name}</p>
        <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => (
            <li key={item.label}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => setTransportOpen(!transportOpen)}
                    className={`flex items-center justify-between gap-3 px-4 py-2 w-full rounded-lg transition-colors hover:bg-gray-800`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {transportOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {transportOpen && (
                    <ul className="ml-4 mt-2 space-y-2">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            className={`flex items-center gap-3 px-4 py-2 w-full rounded-lg transition-colors ${
                              location.pathname === subItem.path
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-800'
                            }`}
                          >
                            <span>{subItem.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 w-full rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-800 rounded-lg transition-colors mt-auto"
      >
        <LogOut className="w-5 h-5" />
        <span>Déconnexion</span>
      </button>
    </div>
  );
};

export default Sidebar;