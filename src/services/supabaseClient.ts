import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes. Veuillez vérifier votre fichier .env.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'wms-system'
    }
  }
});

// Gestion des erreurs pour les requêtes échouées
supabase.handleError = (error: any) => {
  console.error('Erreur Supabase:', error);
  
  if (error.message === 'Failed to fetch') {
    return new Error('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.');
  }
  
  if (error.code === 'PGRST301') {
    return new Error('Erreur de connexion à la base de données. Veuillez réessayer plus tard.');
  }
  
  return error;
};

export default supabase;