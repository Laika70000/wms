import { supabase } from '../supabaseClient';
import { Merchant } from '../../types/merchants';
import { CreateMerchantData, MerchantStatus } from './types';
import { handleApiError } from '../utils/errorHandling';

export const fetchMerchants = async (): Promise<Merchant[]> => {
  try {
    const { data, error } = await supabase
      .from('merchants')
      .select('*, sources (*)');

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleApiError(error, 'Échec de la récupération des marchands');
  }
};

export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    // Vérifier dans auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const emailExists = authData.users.some(user => user.email === email);
    if (emailExists) return false;

    // Vérifier dans merchants
    const { data: merchantData, error: merchantError } = await supabase
      .from('merchants')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (merchantError) throw merchantError;
    return !merchantData;
  } catch (error) {
    throw handleApiError(error, 'Échec de la vérification de l\'email');
  }
};

export const createMerchantUser = async (data: CreateMerchantData) => {
  try {
    // Vérifier si l'email est déjà utilisé
    const isAvailable = await checkEmailAvailability(data.email);
    if (!isAvailable) {
      throw new Error('Un compte existe déjà avec cet email');
    }

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
    if (!authData.user) throw new Error('Échec de la création du compte utilisateur');

    return authData.user;
  } catch (error) {
    throw handleApiError(error, 'Échec de la création du compte utilisateur');
  }
};

export const createMerchantRecord = async (data: {
  name: string;
  email: string;
  companyDetails: CreateMerchantData['companyDetails'];
  userId: string;
}) => {
  try {
    const { error } = await supabase
      .from('merchants')
      .insert([{
        id: data.userId,
        name: data.name,
        email: data.email,
        company_name: data.companyDetails.name,
        phone: data.companyDetails.phone,
        address: data.companyDetails.address,
        city: data.companyDetails.city,
        postal_code: data.companyDetails.postalCode,
        country: data.companyDetails.country,
        status: 'active'
      }]);

    if (error) throw error;
  } catch (error) {
    throw handleApiError(error, 'Échec de la création du profil marchand');
  }
};

export const updateMerchantStatus = async (merchantId: string, status: MerchantStatus) => {
  try {
    const { error } = await supabase
      .from('merchants')
      .update({ status })
      .eq('id', merchantId);

    if (error) throw error;
  } catch (error) {
    throw handleApiError(error, 'Échec de la mise à jour du statut');
  }
};