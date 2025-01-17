import { Source } from './sources';

export interface Merchant {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  sources: Source[];
  isLinked?: boolean;
  createdAt: string;
}