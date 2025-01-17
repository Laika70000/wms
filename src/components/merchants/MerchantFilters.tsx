import React from 'react';
import { Search, Filter } from 'lucide-react';

interface MerchantFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
}

const MerchantFilters: React.FC<MerchantFiltersProps> = ({
  searchTerm,
  onSearchChange,
  sourceFilter,
  onSourceFilterChange
}) => {
  return (
    <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between">
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un marchand..."
          className="flex-1 border-none focus:ring-0"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          className="border-gray-300 rounded-md"
          value={sourceFilter}
          onChange={(e) => onSourceFilterChange(e.target.value)}
        >
          <option value="all">Toutes les sources</option>
          <option value="active">Sources actives</option>
          <option value="error">Sources en erreur</option>
        </select>
      </div>
    </div>
  );
};

export default MerchantFilters;