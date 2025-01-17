import { supabase } from '../supabaseClient';

// Fonction utilitaire pour vérifier le rôle de l'utilisateur courant
export const checkUserRole = async (requiredRole: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.user_metadata?.role === requiredRole;
};

// Fonction pour obtenir l'ID du marchand courant
export const getCurrentMerchantId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// Fonction pour vérifier si l'utilisateur est un logisticien
export const isLogistician = async (): Promise<boolean> => {
  return checkUserRole('logistician');
};

// Fonction pour vérifier si l'utilisateur est un marchand
export const isMerchant = async (): Promise<boolean> => {
  return checkUserRole('merchant');
};

// Fonction pour vérifier si l'utilisateur est un admin
export const isAdmin = async (): Promise<boolean> => {
  return checkUserRole('admin');
};