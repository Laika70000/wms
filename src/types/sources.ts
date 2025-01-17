export type Platform = 'shopify' | 'amazon';
export type SourceStatus = 'active' | 'pending' | 'error';

export interface Source {
  id: string;
  platform: Platform;
  name: string;
  apiKey: string;
  apiSecret: string;
  shopUrl?: string; // Pour Shopify uniquement
  status: SourceStatus;
  lastSync: string | null;
}