import supabase from './supabaseClient';
import { Location } from '../types/inventory';

export const getLocations = async (): Promise<Location[]> => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('aisle', { ascending: true })
    .order('section', { ascending: true })
    .order('shelf', { ascending: true });

  if (error) {
    console.error('Error fetching locations:', error);
    throw new Error('Failed to fetch locations');
  }

  return data || [];
};

export const addLocation = async (location: Partial<Location>): Promise<Location> => {
  const { data, error } = await supabase
    .from('locations')
    .insert([location])
    .select()
    .single();

  if (error) {
    console.error('Error adding location:', error);
    if (error.code === '42501') {
      throw new Error('You do not have permission to add locations');
    }
    throw new Error('Failed to add location');
  }

  if (!data) {
    throw new Error('No data returned after adding location');
  }

  return data;
};

export const updateLocation = async (id: string, location: Partial<Location>): Promise<Location> => {
  const { data, error } = await supabase
    .from('locations')
    .update(location)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating location:', error);
    if (error.code === '42501') {
      throw new Error('You do not have permission to update locations');
    }
    throw new Error('Failed to update location');
  }

  if (!data) {
    throw new Error('No data returned after updating location');
  }

  return data;
};

export const deleteLocation = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting location:', error);
    if (error.code === '42501') {
      throw new Error('You do not have permission to delete locations');
    }
    throw new Error('Failed to delete location');
  }
};