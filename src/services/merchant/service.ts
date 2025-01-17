import { toast } from 'react-hot-toast';
import { CreateMerchantData } from './types';
import * as merchantApi from './api';

export const createMerchant = async (data: CreateMerchantData): Promise<void> => {
  try {
    // Vérifier si l'email est déjà utilisé
    const isAvailable = await merchantApi.checkEmailAvailability(data.email);
    if (!isAvailable) {
      throw new Error('Un compte existe déjà avec cet email');
    }

    // Créer l'utilisateur dans Auth
    const user = await merchantApi.createMerchantUser({
      email: data.email,
      password: data.password,
      name: data.name,
      companyDetails: data.companyDetails
    });

    // Créer le profil marchand
    await merchantApi.createMerchantRecord({
      name: data.name,
      email: data.email,
      companyDetails: data.companyDetails,
      userId: user.id
    });

    toast.success('Compte marchand créé avec succès');
  } catch (error) {
    console.error('Erreur lors de la création du compte marchand:', error);
    
    // Gestion spécifique des erreurs
    if (error instanceof Error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        toast.error('Un compte existe déjà avec cet email');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.error('Erreur lors de la création du compte');
    }
    
    throw error;
  }
};

export const getMerchants = merchantApi.fetchMerchants;