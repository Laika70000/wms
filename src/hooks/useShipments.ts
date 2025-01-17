import { useState, useEffect } from 'react';
import { Shipment } from '../types/tms';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';

export const useShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (shipmentsError) throw shipmentsError;
      setShipments(data || []);
    } catch (err) {
      console.error('Error loading shipments:', err);
      setError('Erreur lors du chargement des expéditions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  return {
    shipments,
    loading,
    error,
    refresh: loadShipments
  };
};