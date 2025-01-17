import { useToast } from './useToast';

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export const useErrorHandler = () => {
  const { showError } = useToast();

  const handleError = (error: unknown): ApiError => {
    // Supabase error
    if (error && typeof error === 'object' && 'code' in error) {
      const supabaseError = error as { code: string; message: string; details?: string };
      
      const errorMessages: Record<string, string> = {
        '23505': 'Cette valeur existe déjà.',
        '42501': 'Vous n\'avez pas les permissions nécessaires.',
        '23503': 'Cette opération n\'est pas possible car il existe des dépendances.',
        'PGRST116': 'Les données fournies sont invalides.',
        'default': 'Une erreur inattendue est survenue.'
      };

      const apiError = {
        code: supabaseError.code,
        message: errorMessages[supabaseError.code] || errorMessages.default,
        details: supabaseError.details
      };

      showError(apiError.message);
      return apiError;
    }

    // Standard error
    if (error instanceof Error) {
      const apiError = {
        code: 'ERROR',
        message: error.message,
        details: error.stack
      };
      showError(apiError.message);
      return apiError;
    }

    // Unknown error
    const apiError = {
      code: 'UNKNOWN',
      message: 'Une erreur inattendue est survenue',
      details: String(error)
    };
    showError(apiError.message);
    return apiError;
  };

  return {
    handleError
  };
};