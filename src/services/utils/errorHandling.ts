import { toast } from 'react-hot-toast';

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export const handleApiError = (error: unknown, defaultMessage: string): never => {
  console.error('API Error:', error);

  // Erreur Supabase Auth
  if (error && typeof error === 'object' && '__isAuthError' in error) {
    const authError = error as { message: string };
    const message = authError.message === 'User already registered' 
      ? 'Un compte existe déjà avec cet email'
      : 'Erreur d\'authentification';
    toast.error(message);
    throw new Error(message);
  }

  // Erreur Supabase Data
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string; details?: string };
    
    const errorMessages: Record<string, string> = {
      '23505': 'Un compte existe déjà avec cet email.',
      '42501': 'Vous n\'avez pas les permissions nécessaires.',
      '23503': 'Cette opération n\'est pas possible car il existe des dépendances.',
      'PGRST116': 'Les données fournies sont invalides.',
      'default': defaultMessage
    };

    const message = errorMessages[supabaseError.code] || errorMessages.default;
    toast.error(message);
    throw new Error(message);
  }

  // Erreur standard
  if (error instanceof Error) {
    toast.error(error.message);
    throw error;
  }

  // Erreur inconnue
  toast.error(defaultMessage);
  throw new Error(defaultMessage);
};

export const showError = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Une erreur est survenue';
  toast.error(message);
};

export const showSuccess = (message: string) => {
  toast.success(message);
};