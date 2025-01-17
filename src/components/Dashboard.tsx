import React from 'react';
import { Package, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { icon: <Package />, label: 'Total Products', value: '1,234' },
    { icon: <TrendingUp />, label: 'Active Orders', value: '56' },
    { icon: <Clock />, label: 'Pending Shipments', value: '23' },
    { icon: <AlertTriangle />, label: 'Low Stock Items', value: '15' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;