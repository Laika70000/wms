import { toast } from 'react-hot-toast';

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export const handleError = (error: unknown): ApiError => {
  // Erreur Supabase
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string; details?: string };
    
    // Mapper les codes d'erreur Supabase vers des messages plus clairs
    const errorMessages: Record<string, string> = {
      '23505': 'Cette valeur existe déjà dans la base de données.',
      '42501': 'Vous n\'avez pas les permissions nécessaires.',
      '23503': 'Cette opération n\'est pas possible car il existe des dépendances.',
      'PGRST116': 'Les données fournies sont invalides.',
      'default': 'Une erreur inattendue est survenue.'
    };

    return {
      code: supabaseError.code,
      message: errorMessages[supabaseError.code] || errorMessages.default,
      details: supabaseError.details
    };
  }

  // Erreur standard
  if (error instanceof Error) {
    return {
      code: 'ERROR',
      message: error.message,
      details: error.stack
    };
  }

  // Erreur inconnue
  return {
    code: 'UNKNOWN',
    message: 'Une erreur inattendue est survenue',
    details: String(error)
  };
};

export const showError = (error: unknown) => {
  const { message } = handleError(error);
  toast.error(message, {
    duration: 4000,
    position: 'top-right'
  });
};

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right'
  });
};