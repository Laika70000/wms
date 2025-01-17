import React from 'react';
import { Save, RefreshCw } from 'lucide-react';
import CarrierLogo from './CarrierLogo';

interface CarrierSettingsCardProps {
  carrier: {
    id: string;
    name: string;
    code: string;
  };
  settings: {
    contract_number?: string;
    api_key?: string;
    api_secret?: string;
  };
  onSave: (data: any) => Promise<void>;
  onTest: () => Promise<void>;
  isSaving: boolean;
  isTesting: boolean;
}

const CarrierSettingsCard: React.FC<CarrierSettingsCardProps> = ({
  carrier,
  settings,
  onSave,
  onTest,
  isSaving,
  isTesting
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSave({
      contract_number: formData.get('contract_number'),
      api_key: formData.get('api_key'),
      api_secret: formData.get('api_secret')
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-4 mb-6">
        <CarrierLogo code={carrier.code} />
        <div>
          <h2 className="text-lg font-semibold">{carrier.name}</h2>
          <p className="text-sm text-gray-500">{carrier.code}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {carrier.code === 'COLISSIMO' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de contrat
              </label>
              <input
                type="text"
                name="contract_number"
                defaultValue={settings.contract_number || ''}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                name="api_secret"
                defaultValue={settings.api_secret || ''}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </>
        )}

        {carrier.code !== 'COLISSIMO' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clé API
              </label>
              <input
                type="text"
                name="api_key"
                defaultValue={settings.api_key || ''}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secret API
              </label>
              <input
                type="password"
                name="api_secret"
                defaultValue={settings.api_secret || ''}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onTest}
            disabled={isTesting || isSaving}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
          >
            <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Test en cours...' : 'Tester la connexion'}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CarrierSettingsCard;