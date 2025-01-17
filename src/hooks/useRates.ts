import { useState, useEffect } from 'react';
import { CarrierRate } from '../types/tms';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';

export const useRates = () => {
  const [rates, setRates] = useState<CarrierRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: ratesError } = await supabase
        .from('carrier_rates')
        .select(`
          *,
          carrier:carriers(name),
          service:carrier_services(name),
          zone:carrier_zones(name)
        `)
        .order('carrier_id', { ascending: true })
        .order('service_id', { ascending: true })
        .order('weight_from', { ascending: true });

      if (ratesError) throw ratesError;

      setRates(data || []);
    } catch (err) {
      console.error('Error loading rates:', err);
      setError('Erreur lors du chargement des tarifs');
      toast.error('Erreur lors du chargement des tarifs');
    } finally {
      setLoading(false);
    }
  };

  const createRate = async (data: {
    carrierId: string;
    serviceId: string;
    zoneId: string;
    weightFrom: number;
    weightTo: number;
    price: number;
    fuelSurchargePercent: number;
  }) => {
    try {
      const { error: createError } = await supabase
        .from('carrier_rates')
        .insert([{
          carrier_id: data.carrierId,
          service_id: data.serviceId,
          zone_id: data.zoneId,
          weight_from: data.weightFrom,
          weight_to: data.weightTo,
          price: data.price,
          fuel_surcharge_percent: data.fuelSurchargePercent
        }]);

      if (createError) throw createError;

      toast.success('Tarif créé avec succès');
      await loadRates();
    } catch (err) {
      console.error('Error creating rate:', err);
      toast.error('Erreur lors de la création du tarif');
      throw err;
    }
  };

  const updateRate = async (id: string, data: {
    weightFrom?: number;
    weightTo?: number;
    price?: number;
    fuelSurchargePercent?: number;
  }) => {
    try {
      const { error: updateError } = await supabase
        .from('carrier_rates')
        .update({
          weight_from: data.weightFrom,
          weight_to: data.weightTo,
          price: data.price,
          fuel_surcharge_percent: data.fuelSurchargePercent,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Tarif mis à jour avec succès');
      await loadRates();
    } catch (err) {
      console.error('Error updating rate:', err);
      toast.error('Erreur lors de la mise à jour du tarif');
      throw err;
    }
  };

  const deleteRate = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('carrier_rates')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Tarif supprimé avec succès');
      await loadRates();
    } catch (err) {
      console.error('Error deleting rate:', err);
      toast.error('Erreur lors de la suppression du tarif');
      throw err;
    }
  };

  const calculateShippingCost = async (params: {
    carrierId: string;
    serviceId: string;
    zoneId: string;
    weight: number;
    declaredValue?: number;
  }) => {
    try {
      const { data, error } = await supabase.rpc('calculate_shipping_cost', {
        p_carrier_id: params.carrierId,
        p_service_id: params.serviceId,
        p_zone_id: params.zoneId,
        p_weight: params.weight,
        p_declared_value: params.declaredValue || 0
      });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error calculating shipping cost:', err);
      toast.error('Erreur lors du calcul du tarif');
      throw err;
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  return {
    rates,
    loading,
    error,
    refresh: loadRates,
    createRate,
    updateRate,
    deleteRate,
    calculateShippingCost
  };
};