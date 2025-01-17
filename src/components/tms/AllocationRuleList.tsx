import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Edit2, Trash2 } from 'lucide-react';

interface AllocationRule {
  id: string;
  name: string;
  priority: number;
  carrier: {
    name: string;
  };
  service: {
    name: string;
  };
  conditions: {
    minWeight?: number;
    maxWeight?: number;
    minValue?: number;
    maxValue?: number;
    countries?: string[];
  };
}

interface AllocationRuleListProps {
  rules: AllocationRule[];
  onEdit?: (rule: AllocationRule) => void;
  onDelete?: (ruleId: string) => void;
  onMovePriority?: (ruleId: string, direction: 'up' | 'down') => void;
}

const AllocationRuleList: React.FC<AllocationRuleListProps> = ({
  rules,
  onEdit,
  onDelete,
  onMovePriority
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Priorité
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Nom
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Transporteur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Service
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Conditions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rules.map((rule) => (
            <tr key={rule.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{rule.priority}</span>
                  {onMovePriority && (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => onMovePriority(rule.id, 'up')}
                        className="text-gray-400 hover:text-gray-600"
                        title="Monter la priorité"
                      >
                        <ArrowUpCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onMovePriority(rule.id, 'down')}
                        className="text-gray-400 hover:text-gray-600"
                        title="Baisser la priorité"
                      >
                        <ArrowDownCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {rule.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {rule.carrier.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {rule.service.name}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">
                  {rule.conditions.minWeight && (
                    <div>Poids min: {rule.conditions.minWeight} kg</div>
                  )}
                  {rule.conditions.maxWeight && (
                    <div>Poids max: {rule.conditions.maxWeight} kg</div>
                  )}
                  {rule.conditions.minValue && (
                    <div>Valeur min: {rule.conditions.minValue} €</div>
                  )}
                  {rule.conditions.maxValue && (
                    <div>Valeur max: {rule.conditions.maxValue} €</div>
                  )}
                  {rule.conditions.countries && rule.conditions.countries.length > 0 && (
                    <div>Pays: {rule.conditions.countries.join(', ')}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(rule)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(rule.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllocationRuleList;