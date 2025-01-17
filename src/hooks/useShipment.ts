import { useState, useEffect } from 'react';
import { Shipment, ShipmentEvent } from '../types/tms';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';

export const useShipment = (id: string) => {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [events, setEvents] = useState<ShipmentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShipment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger l'expédition avec les détails du transporteur et du service
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select(`
          *,
          carrier:carriers(name, code),
          service:carrier_services(name, code)
        `)
        .eq('id', id)
        .single();

      if (shipmentError) throw shipmentError;

      // Charger les événements de suivi
      const { data: eventsData, error: eventsError } = await supabase
        .from('shipment_events')
        .select('*')
        .eq('shipment_id', id)
        .order('occurred_at', { ascending: false });

      if (eventsError) throw eventsError;

      setShipment(shipmentData);
      setEvents(eventsData || []);
    } catch (err) {
      console.error('Error loading shipment:', err);
      setError('Erreur lors du chargement de l\'expédition');
      toast.error('Erreur lors du chargement de l\'expédition');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: Shipment['status']) => {
    try {
      const { error: updateError } = await supabase
        .from('shipments')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Statut mis à jour avec succès');
      await loadShipment();
    } catch (err) {
      console.error('Error updating shipment status:', err);
      toast.error('Erreur lors de la mise à jour du statut');
      throw err;
    }
  };

  const addEvent = async (data: {
    status: string;
    location?: string;
    description?: string;
    occurredAt: Date;
    rawData?: any;
  }) => {
    try {
      const { error: eventError } = await supabase
        .from('shipment_events')
        .insert([{
          shipment_id: id,
          status: data.status,
          location: data.location,
          description: data.description,
          occurred_at: data.occurredAt.toISOString(),
          raw_data: data.rawData
        }]);

      if (eventError) throw eventError;

      toast.success('Événement ajouté avec succès');
      await loadShipment();
    } catch (err) {
      console.error('Error adding shipment event:', err);
      toast.error('Erreur lors de l\'ajout de l\'événement');
      throw err;
    }
  };

  const updateShippingLabel = async (labelUrl: string) => {
    try {
      const { error: updateError } = await supabase
        .from('shipments')
        .update({
          label_url: labelUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Étiquette mise à jour avec succès');
      await loadShipment();
    } catch (err) {
      console.error('Error updating shipping label:', err);
      toast.error('Erreur lors de la mise à jour de l\'étiquette');
      throw err;
    }
  };

  const updateTrackingNumber = async (trackingNumber: string) => {
    try {
      const { error: updateError } = await supabase
        .from('shipments')
        .update({
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Numéro de suivi mis à jour avec succès');
      await loadShipment();
    } catch (err) {
      console.error('Error updating tracking number:', err);
      toast.error('Erreur lors de la mise à jour du numéro de suivi');
      throw err;
    }
  };

  useEffect(() => {
    loadShipment();
  }, [id]);

  return {
    shipment,
    events,
    loading,
    error,
    refresh: loadShipment,
    updateStatus,
    addEvent,
    updateShippingLabel,
    updateTrackingNumber
  };
};