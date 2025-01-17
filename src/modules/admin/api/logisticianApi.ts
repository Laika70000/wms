import supabase from '../../../services/supabaseClient';
import { Logistician } from '../types/Logistician';

export const getLogisticians = async (): Promise<Logistician[]> => {
  const { data, error } = await supabase
    .from('logisticians')
    .select(`
      *,
      merchant_count:merchant_logisticians(count)
    `);

  if (error) throw error;
  return data;
};

export const createLogistician = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<void> => {
  const { error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        role: 'logistician',
        name: data.name
      }
    }
  });

  if (authError) throw authError;

  const { error: logisticianError } = await supabase
    .from('logisticians')
    .insert([{
      name: data.name,
      email: data.email,
      status: 'active'
    }]);

  if (logisticianError) throw logisticianError;
};

export const updateLogisticianStatus = async (
  id: string,
  status: 'active' | 'inactive'
): Promise<void> => {
  const { error } = await supabase
    .from('logisticians')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
};