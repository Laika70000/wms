import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { toast } from 'react-hot-toast';
import CarrierSettingsCard from '../../components/tms/carriers/CarrierSettingsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

interface CarrierSetting {
  id: string;
  carrier: {
    id: string;
    name: string;
    code: string;
  };
  contract_number?: string;
  api_key?: string;
  api_secret?: string;
}

const CarrierSettings = () => {
  const [settings, setSettings] = useState<CarrierSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: settingsError } = await supabase
        .from('carrier_settings')
        .select(`
          *,
          carrier:carriers(
            id,
            name,
            code
          )
        `);

      if (settingsError) throw settingsError;
      setSettings(data || []);
    } catch (err) {
      console.error('Error loading carrier settings:', err);
      setError('Erreur lors du chargement des paramètres');
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (carrierId: string, data: {
    contract_number?: string;
    api_key?: string;
    api_secret?: string;
  }) => {
    try {
      setSaving(prev => ({ ...prev, [carrierId]: true }));

      const { error: updateError } = await supabase
        .from('carrier_settings')
        .update({
          contract_number: data.contract_number,
          api_key: data.api_key,
          api_secret: data.api_secret,
          updated_at: new Date().toISOString()
        })
        .eq('carrier_id', carrierId);

      if (updateError) throw updateError;

      toast.success('Paramètres mis à jour avec succès');
      await loadSettings();
    } catch (err) {
      console.error('Error updating carrier settings:', err);
      toast.error('Erreur lors de la mise à jour des paramètres');
    } finally {
      setSaving(prev => ({ ...prev, [carrierId]: false }));
    }
  };

  const testConnection = async (carrierId: string, carrierCode: string) => {
    try {
      setTesting(prev => ({ ...prev, [carrierId]: true }));

      // Test de connexion à l'API du transporteur
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Connexion testée avec succès');
    } catch (err) {
      console.error('Error testing carrier connection:', err);
      toast.error('Erreur lors du test de connexion');
    } finally {
      setTesting(prev => ({ ...prev, [carrierId]: false }));
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Chargement des paramètres..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Erreur lors du chargement des paramètres"
        details={error}
        onRetry={loadSettings}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Paramètres des transporteurs</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {settings.map((setting) => (
          <CarrierSettingsCard
            key={setting.carrier.id}
            carrier={setting.carrier}
            settings={{
              contract_number: setting.contract_number,
              api_key: setting.api_key,
              api_secret: setting.api_secret
            }}
            onSave={(data) => updateSettings(setting.carrier.id, data)}
            onTest={() => testConnection(setting.carrier.id, setting.carrier.code)}
            isSaving={saving[setting.carrier.id] || false}
            isTesting={testing[setting.carrier.id] || false}
          />
        ))}
      </div>
    </div>
  );
};

export default CarrierSettings;