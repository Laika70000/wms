import { Source } from '../types/sources';
import { supabase } from './supabaseClient';
import { toast } from 'react-hot-toast';

export const fetchMerchantSources = async (merchantId: string): Promise<Source[]> => {
  try {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .eq('merchant_id', merchantId);

    if (error) {
      const errorMessage = error.message === 'Failed to fetch' 
        ? 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.'
        : error.message;
      throw new Error(errorMessage);
    }

    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des sources:', error);
    const errorMessage = error instanceof Error ? error.message : 'Échec de la récupération des sources';
    toast.error(errorMessage);
    throw error;
  }
};

export const addSource = async (merchantId: string, source: Omit<Source, 'id' | 'status' | 'lastSync'>) => {
  try {
    const { data, error } = await supabase
      .from('sources')
      .insert([{
        merchant_id: merchantId,
        platform: source.platform,
        name: source.name,
        api_key: source.apiKey,
        api_secret: source.apiSecret,
        shop_url: source.shopUrl,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    toast.success('Source ajoutée avec succès');
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la source:', error);
    const errorMessage = error instanceof Error ? error.message : 'Échec de l\'ajout de la source';
    toast.error(errorMessage);
    throw error;
  }
};

export const deleteSource = async (sourceId: string) => {
  try {
    const { error } = await supabase
      .from('sources')
      .delete()
      .eq('id', sourceId);

    if (error) throw error;
    toast.success('Source supprimée avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de la source:', error);
    const errorMessage = error instanceof Error ? error.message : 'Échec de la suppression de la source';
    toast.error(errorMessage);
    throw error;
  }
};

export const syncSourceOrders = async (source: Source) => {
  try {
    const { data, error } = await supabase
      .from('sources')
      .update({ 
        last_sync: new Date().toISOString(),
        status: 'active'
      })
      .eq('id', source.id)
      .select()
      .single();

    if (error) throw error;
    toast.success('Source synchronisée avec succès');
    return data;
  } catch (error) {
    console.error('Erreur lors de la synchronisation de la source:', error);
    const errorMessage = error instanceof Error ? error.message : 'Échec de la synchronisation de la source';
    toast.error(errorMessage);
    throw error;
  }
};