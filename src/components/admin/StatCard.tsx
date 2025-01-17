import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  description
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-full">
          {icon}
        </div>
        <div>
          <h3 className="text-gray-600">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;