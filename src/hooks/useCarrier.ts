import { useState, useEffect } from 'react';
import { Carrier } from '../types/tms';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';

export const useCarrier = (id: string) => {
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCarrier = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger le transporteur avec ses services et zones
      const { data, error: carrierError } = await supabase
        .from('carriers')
        .select(`
          *,
          services:carrier_services(
            id,
            name,
            code,
            type,
            transit_time_min,
            transit_time_max
          ),
          zones:carrier_zones(
            id,
            name,
            code,
            countries
          )
        `)
        .eq('id', id)
        .single();

      if (carrierError) throw carrierError;

      setCarrier(data);
    } catch (err) {
      console.error('Error loading carrier:', err);
      setError('Erreur lors du chargement du transporteur');
      toast.error('Erreur lors du chargement du transporteur');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: 'active' | 'inactive') => {
    try {
      const { error: updateError } = await supabase
        .from('carriers')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Statut mis à jour avec succès');
      await loadCarrier();
    } catch (err) {
      console.error('Error updating carrier status:', err);
      toast.error('Erreur lors de la mise à jour du statut');
      throw err;
    }
  };

  const updateApiCredentials = async (credentials: {
    apiKey?: string;
    apiSecret?: string;
  }) => {
    try {
      const { error: updateError } = await supabase
        .from('carriers')
        .update({
          api_key: credentials.apiKey,
          api_secret: credentials.apiSecret,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Identifiants API mis à jour avec succès');
      await loadCarrier();
    } catch (err) {
      console.error('Error updating API credentials:', err);
      toast.error('Erreur lors de la mise à jour des identifiants API');
      throw err;
    }
  };

  useEffect(() => {
    loadCarrier();
  }, [id]);

  return {
    carrier,
    loading,
    error,
    refresh: loadCarrier,
    updateStatus,
    updateApiCredentials
  };
};