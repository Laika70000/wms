import { useState, useEffect } from 'react';
import { Carrier } from '../types/tms';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';

export const useCarriers = () => {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCarriers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: carriersError } = await supabase
        .from('carriers')
        .select('*')
        .order('name', { ascending: true });

      if (carriersError) throw carriersError;

      setCarriers(data || []);
    } catch (err) {
      console.error('Error loading carriers:', err);
      setError('Erreur lors du chargement des transporteurs');
      toast.error('Erreur lors du chargement des transporteurs');
    } finally {
      setLoading(false);
    }
  };

  const createCarrier = async (data: {
    name: string;
    code: string;
    type: 'express' | 'standard' | 'economy';
    apiKey?: string;
    apiSecret?: string;
  }) => {
    try {
      const { error: createError } = await supabase
        .from('carriers')
        .insert([{
          name: data.name,
          code: data.code,
          type: data.type,
          api_key: data.apiKey,
          api_secret: data.apiSecret,
          status: 'active'
        }]);

      if (createError) throw createError;

      toast.success('Transporteur créé avec succès');
      await loadCarriers();
    } catch (err) {
      console.error('Error creating carrier:', err);
      toast.error('Erreur lors de la création du transporteur');
      throw err;
    }
  };

  const updateCarrier = async (id: string, data: {
    name?: string;
    code?: string;
    type?: 'express' | 'standard' | 'economy';
    status?: 'active' | 'inactive';
    apiKey?: string;
    apiSecret?: string;
  }) => {
    try {
      const { error: updateError } = await supabase
        .from('carriers')
        .update({
          name: data.name,
          code: data.code,
          type: data.type,
          status: data.status,
          api_key: data.apiKey,
          api_secret: data.apiSecret,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Transporteur mis à jour avec succès');
      await loadCarriers();
    } catch (err) {
      console.error('Error updating carrier:', err);
      toast.error('Erreur lors de la mise à jour du transporteur');
      throw err;
    }
  };

  const deleteCarrier = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('carriers')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Transporteur supprimé avec succès');
      await loadCarriers();
    } catch (err) {
      console.error('Error deleting carrier:', err);
      toast.error('Erreur lors de la suppression du transporteur');
      throw err;
    }
  };

  useEffect(() => {
    loadCarriers();
  }, []);

  return {
    carriers,
    loading,
    error,
    refresh: loadCarriers,
    createCarrier,
    updateCarrier,
    deleteCarrier
  };
};