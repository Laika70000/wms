import { supabase } from '../supabaseClient';
import { Merchant } from '../../types/merchants';
import { toast } from 'react-hot-toast';

export const getMerchants = async (): Promise<Merchant[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('merchants')
      .select('*, sources (*)')
      .eq('id', user.id); // Only fetch current merchant's data

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching merchants:', error);
    toast.error('Failed to fetch merchants');
    return [];
  }
};

export const createMerchant = async (data: { 
  name: string; 
  email: string; 
  password: string; 
}): Promise<void> => {
  try {
    // First create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: 'merchant',
          name: data.name
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned');

    // Then create merchant record with same ID
    const { error: merchantError } = await supabase
      .from('merchants')
      .insert([{
        id: authData.user.id, // Use same ID as auth user
        name: data.name,
        email: data.email,
        status: 'active'
      }]);

    if (merchantError) throw merchantError;
    toast.success('Merchant created successfully');
  } catch (error) {
    console.error('Error creating merchant:', error);
    toast.error('Failed to create merchant');
    throw error;
  }
};