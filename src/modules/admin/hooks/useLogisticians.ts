import { useState, useEffect } from 'react';
import { Logistician } from '../types/Logistician';
import * as logisticianApi from '../api/logisticianApi';
import { useToast } from '../../../hooks/useToast';

export const useLogisticians = () => {
  const [logisticians, setLogisticians] = useState<Logistician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const loadLogisticians = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await logisticianApi.getLogisticians();
      setLogisticians(data);
    } catch (err) {
      console.error('Error loading logisticians:', err);
      setError('Erreur lors du chargement des logisticiens');
      showError('Erreur lors du chargement des logisticiens');
    } finally {
      setLoading(false);
    }
  };

  const createLogistician = async (data: { name: string; email: string; password: string }) => {
    try {
      await logisticianApi.createLogistician(data);
      showSuccess('Logisticien créé avec succès');
      await loadLogisticians();
    } catch (err) {
      showError('Erreur lors de la création du logisticien');
      throw err;
    }
  };

  const updateStatus = async (id: string, status: 'active' | 'inactive') => {
    try {
      await logisticianApi.updateLogisticianStatus(id, status);
      showSuccess('Statut mis à jour avec succès');
      await loadLogisticians();
    } catch (err) {
      showError('Erreur lors de la mise à jour du statut');
      throw err;
    }
  };

  useEffect(() => {
    loadLogisticians();
  }, []);

  return {
    logisticians,
    loading,
    error,
    refresh: loadLogisticians,
    createLogistician,
    updateStatus
  };
};