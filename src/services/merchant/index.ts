import { createMerchant, getMerchants } from './service';
import { updateMerchantStatus } from './api';
import { linkMerchant, unlinkMerchant } from './links';

export {
  createMerchant,
  getMerchants,
  updateMerchantStatus,
  linkMerchant,
  unlinkMerchant
};

export type { CreateMerchantData, MerchantStatus } from './types';