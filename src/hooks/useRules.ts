import { useState, useEffect } from 'react';
import { CarrierAllocationRule } from '../types/tms';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';

export const useRules = () => {
  const [rules, setRules] = useState<CarrierAllocationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRules = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rulesError } = await supabase
        .from('carrier_allocation_rules')
        .select(`
          *,
          carrier:carriers(name),
          service:carrier_services(name)
        `)
        .order('priority', { ascending: true });

      if (rulesError) throw rulesError;

      setRules(data || []);
    } catch (err) {
      console.error('Error loading rules:', err);
      setError('Erreur lors du chargement des règles');
      toast.error('Erreur lors du chargement des règles');
    } finally {
      setLoading(false);
    }
  };

  const createRule = async (data: {
    name: string;
    priority: number;
    carrierId: string;
    serviceId: string;
    conditions: {
      minWeight?: number;
      maxWeight?: number;
      minValue?: number;
      maxValue?: number;
      countries?: string[];
    };
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: createError } = await supabase
        .from('carrier_allocation_rules')
        .insert([{
          merchant_id: user.id,
          name: data.name,
          priority: data.priority,
          carrier_id: data.carrierId,
          service_id: data.serviceId,
          conditions: data.conditions
        }]);

      if (createError) throw createError;

      toast.success('Règle créée avec succès');
      await loadRules();
    } catch (err) {
      console.error('Error creating rule:', err);
      toast.error('Erreur lors de la création de la règle');
      throw err;
    }
  };

  const updateRule = async (id: string, data: {
    name?: string;
    priority?: number;
    carrierId?: string;
    serviceId?: string;
    conditions?: {
      minWeight?: number;
      maxWeight?: number;
      minValue?: number;
      maxValue?: number;
      countries?: string[];
    };
  }) => {
    try {
      const { error: updateError } = await supabase
        .from('carrier_allocation_rules')
        .update({
          name: data.name,
          priority: data.priority,
          carrier_id: data.carrierId,
          service_id: data.serviceId,
          conditions: data.conditions,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Règle mise à jour avec succès');
      await loadRules();
    } catch (err) {
      console.error('Error updating rule:', err);
      toast.error('Erreur lors de la mise à jour de la règle');
      throw err;
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('carrier_allocation_rules')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Règle supprimée avec succès');
      await loadRules();
    } catch (err) {
      console.error('Error deleting rule:', err);
      toast.error('Erreur lors de la suppression de la règle');
      throw err;
    }
  };

  const updatePriority = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentRule = rules.find(r => r.id === id);
      if (!currentRule) return;

      const currentIndex = rules.findIndex(r => r.id === id);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= rules.length) return;

      const otherRule = rules[newIndex];

      // Swap priorities
      await Promise.all([
        supabase
          .from('carrier_allocation_rules')
          .update({ priority: otherRule.priority })
          .eq('id', currentRule.id),
        supabase
          .from('carrier_allocation_rules')
          .update({ priority: currentRule.priority })
          .eq('id', otherRule.id)
      ]);

      await loadRules();
      toast.success('Priorité mise à jour avec succès');
    } catch (err) {
      console.error('Error updating priority:', err);
      toast.error('Erreur lors de la mise à jour de la priorité');
      throw err;
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  return {
    rules,
    loading,
    error,
    refresh: loadRules,
    createRule,
    updateRule,
    deleteRule,
    updatePriority
  };
};