import supabase from '../../../services/supabaseClient';
import { Source } from '../types/Source';

export const getSources = async (): Promise<Source[]> => {
  const { data, error } = await supabase
    .from('sources')
    .select('*');

  if (error) throw error;
  return data;
};

export const addSource = async (source: Partial<Source>): Promise<Source> => {
  const { data, error } = await supabase
    .from('sources')
    .insert([source])
    .select()
    .single();

  if (error) throw error;
  return data;
};