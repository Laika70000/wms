import axios from 'axios';
import { supabase } from '../supabaseClient';

interface ChronopostLabel {
  trackingNumber: string;
  label: string; // Base64
}

interface ChronopostTrackingEvent {
  date: string;
  code: string;
  label: string;
  site: string;
}

export class ChronopostService {
  private baseUrl: string;
  private accountNumber: string | null = null;
  private password: string | null = null;

  constructor() {
    this.baseUrl = 'https://ws.chronopost.fr';
  }

  private async loadCredentials() {
    const { data, error } = await supabase
      .from('carrier_settings')
      .select('contract_number, api_secret')
      .eq('carrier_id', 'CHRONOPOST')
      .single();

    if (error) throw error;
    if (!data?.contract_number || !data?.api_secret) {
      throw new Error('Chronopost credentials not configured');
    }

    this.accountNumber = data.contract_number;
    this.password = data.api_secret;
  }

  private async ensureCredentials() {
    if (!this.accountNumber || !this.password) {
      await this.loadCredentials();
    }
  }

  async generateLabel(data: {
    shipmentDetails: {
      weight: number;
      dimensions?: {
        length: number;
        width: number;
        height: number;
      };
    };
    sender: {
      name: string;
      company: string;
      street: string;
      city: string;
      postalCode: string;
      country: string;
      email: string;
      phone?: string;
    };
    recipient: {
      name: string;
      company?: string;
      street: string;
      city: string;
      postalCode: string;
      country: string;
      email: string;
      phone?: string;
    };
    productCode: string;
    reference?: string;
  }): Promise<ChronopostLabel> {
    try {
      await this.ensureCredentials();

      const response = await axios.post(
        `${this.baseUrl}/shipping-api/v1/shipping/shipment`,
        {
          accountNumber: this.accountNumber,
          password: this.password,
          version: '2.0',
          shipment: {
            shipper: {
              shipperName: data.sender.name,
              shipperName2: data.sender.company,
              shipperStreet: data.sender.street,
              shipperCity: data.sender.city,
              shipperZipCode: data.sender.postalCode,
              shipperCountry: data.sender.country,
              shipperEmail: data.sender.email,
              shipperPhone: data.sender.phone
            },
            customer: {
              customerName: data.recipient.name,
              customerName2: data.recipient.company,
              customerStreet: data.recipient.street,
              customerCity: data.recipient.city,
              customerZipCode: data.recipient.postalCode,
              customerCountry: data.recipient.country,
              customerEmail: data.recipient.email,
              customerPhone: data.recipient.phone
            },
            skybill: {
              productCode: data.productCode,
              shipDate: new Date().toISOString().split('T')[0],
              shipHour: new Date().getHours().toString(),
              weight: data.shipmentDetails.weight,
              length: data.shipmentDetails.dimensions?.length,
              width: data.shipmentDetails.dimensions?.width,
              height: data.shipmentDetails.dimensions?.height,
              objectType: 'MAR',
              content1: data.reference
            },
            skybillParams: {
              mode: 'PDF',
              withReservation: 0
            }
          }
        }
      );

      return {
        trackingNumber: response.data.skybill.skybillNumber,
        label: response.data.skybill.pdf
      };
    } catch (error) {
      console.error('Error generating Chronopost label:', error);
      throw new Error('Failed to generate shipping label');
    }
  }

  async trackShipment(trackingNumber: string): Promise<ChronopostTrackingEvent[]> {
    try {
      await this.ensureCredentials();

      const response = await axios.post(
        `${this.baseUrl}/tracking-api/v1/tracking`,
        {
          accountNumber: this.accountNumber,
          password: this.password,
          skybillNumber: trackingNumber,
          language: 'fr_FR'
        }
      );

      return response.data.events.map((event: any) => ({
        date: event.date,
        code: event.code,
        label: event.label,
        site: event.site
      }));
    } catch (error) {
      console.error('Error tracking Chronopost shipment:', error);
      throw new Error('Failed to track shipment');
    }
  }
}

export const chronopost = new ChronopostService();