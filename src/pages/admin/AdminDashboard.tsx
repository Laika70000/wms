import React from 'react';
import { Users, ShoppingBag, BarChart2 } from 'lucide-react';
import { useStats } from '../../modules/admin/hooks/useStats';
import StatCard from '../../components/admin/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const AdminDashboard = () => {
  const { stats, loading, error, refresh } = useStats();

  if (loading) {
    return <LoadingSpinner message="Chargement des statistiques..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement des statistiques"
        details={error}
        onRetry={refresh}
      />
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord administrateur</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Users className="w-8 h-8 text-blue-500" />}
          title="Logisticiens"
          value={stats.logisticiansCount}
          description="Comptes actifs"
        />
        <StatCard
          icon={<ShoppingBag className="w-8 h-8 text-green-500" />}
          title="Marchands"
          value={stats.merchantsCount}
          description="Comptes actifs"
        />
        <StatCard
          icon={<BarChart2 className="w-8 h-8 text-purple-500" />}
          title="Commandes"
          value={stats.ordersCount}
          description="En cours de traitement"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;