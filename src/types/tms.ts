export interface Carrier {
  id: string;
  name: string;
  code: string;
  type: 'express' | 'standard' | 'economy';
  status: 'active' | 'inactive';
  apiKey?: string;
  apiSecret?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrierId: string;
  trackingNumber?: string;
  status: 'pending' | 'label_created' | 'picked_up' | 'in_transit' | 'delivered' | 'exception';
  labelUrl?: string;
  weight?: number;
  cost?: number;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: string;
  location?: string;
  description?: string;
  timestamp: string;
  createdAt: string;
}