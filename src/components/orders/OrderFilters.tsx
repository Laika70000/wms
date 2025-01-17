import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between bg-white rounded-t-lg">
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher une commande..."
          className="flex-1 border-none focus:ring-0"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            className="border-gray-300 rounded-md"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
          />
          <span className="text-gray-500">à</span>
          <input
            type="date"
            className="border-gray-300 rounded-md"
            value={dateRange.end}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            className="border-gray-300 rounded-md"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="processing">En préparation</option>
            <option value="ready">Prêt à expédier</option>
            <option value="shipped">Expédié</option>
            <option value="delivered">Livré</option>
            <option value="returned">Retourné</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;