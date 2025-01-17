export interface Logistician {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  merchantCount: number;
  lastLogin: string | null;
  createdAt: string;
}