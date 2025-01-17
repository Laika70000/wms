export * from './colissimoService';
export * from './dhlService';
export * from './upsService';
export * from './fedexService';
export * from './chronopostService';
export * from './mondialRelayService';

// Types communs
export interface ShippingLabel {
  trackingNumber: string;
  label: string; // Base64
  customsDocuments?: string[]; // Base64
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface CarrierService {
  generateLabel(data: any): Promise<ShippingLabel>;
  trackShipment(trackingNumber: string): Promise<TrackingEvent[]>;
}