import supabase from '../../../services/supabaseClient';
import { Location } from '../types/Location';

export const getLocations = async (): Promise<Location[]> => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('aisle', { ascending: true })
    .order('section', { ascending: true })
    .order('shelf', { ascending: true });

  if (error) throw error;
  return data;
};

export const addLocation = async (location: Partial<Location>): Promise<Location> => {
  const { data, error } = await supabase
    .from('locations')
    .insert([location])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateLocation = async (id: string, location: Partial<Location>): Promise<Location> => {
  const { data, error } = await supabase
    .from('locations')
    .update(location)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteLocation = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);

  if (error) throw error;
};