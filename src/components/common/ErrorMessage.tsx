import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  details?: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  details,
  onRetry 
}) => {
  return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-medium text-red-800">{message}</h3>
        </div>
        
        {details && (
          <p className="text-sm text-red-700 mt-1 mb-3">{details}</p>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-red-700 hover:text-red-800 font-medium"
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;