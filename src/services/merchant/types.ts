export interface CreateMerchantData {
  name: string;
  email: string;
  password: string;
  companyDetails: {
    name: string;
    phone?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export type MerchantStatus = 'active' | 'inactive' | 'suspended';

export interface MerchantStats {
  totalOrders: number;
  pendingOrders: number;
  lastActivity: string | null;
}