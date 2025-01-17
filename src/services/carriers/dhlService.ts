import axios from 'axios';
import { supabase } from '../supabaseClient';

interface DHLLabel {
  trackingNumber: string;
  label: string; // Base64
  customsDocuments?: string[]; // Base64
}

interface DHLTrackingEvent {
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

export class DHLService {
  private baseUrl: string;
  private siteId: string | null = null;
  private password: string | null = null;

  constructor() {
    this.baseUrl = 'https://api-mock.dhl.com/mydhl/v1';
  }

  private async loadCredentials() {
    const { data, error } = await supabase
      .from('carrier_settings')
      .select('contract_number, api_secret')
      .eq('carrier_id', 'DHL')
      .single();

    if (error) throw error;
    if (!data?.contract_number || !data?.api_secret) {
      throw new Error('DHL credentials not configured');
    }

    this.siteId = data.contract_number;
    this.password = data.api_secret;
  }

  private async ensureCredentials() {
    if (!this.siteId || !this.password) {
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
    service: {
      product: string;
      option?: string[];
    };
    customs?: {
      incoterm: string;
      items: Array<{
        description: string;
        quantity: number;
        value: number;
        weight: number;
        hsCode?: string;
      }>;
    };
  }): Promise<DHLLabel> {
    try {
      await this.ensureCredentials();

      const response = await axios.post(
        `${this.baseUrl}/shipments`,
        {
          plannedShippingDateAndTime: new Date().toISOString(),
          pickup: {
            isRequested: false
          },
          productCode: data.service.product,
          accounts: [
            {
              typeCode: 'shipper',
              number: this.siteId
            }
          ],
          customerDetails: {
            shipperDetails: {
              postalAddress: {
                cityName: data.sender.city,
                countryCode: data.sender.country,
                postalCode: data.sender.postalCode,
                addressLine1: data.sender.street
              },
              contactInformation: {
                email: data.sender.email,
                phone: data.sender.phone,
                companyName: data.sender.company,
                fullName: data.sender.name
              }
            },
            receiverDetails: {
              postalAddress: {
                cityName: data.recipient.city,
                countryCode: data.recipient.country,
                postalCode: data.recipient.postalCode,
                addressLine1: data.recipient.street
              },
              contactInformation: {
                email: data.recipient.email,
                phone: data.recipient.phone,
                companyName: data.recipient.company,
                fullName: data.recipient.name
              }
            }
          },
          content: {
            packages: [
              {
                weight: data.shipmentDetails.weight,
                dimensions: data.shipmentDetails.dimensions
              }
            ],
            isCustomsDeclarable: !!data.customs,
            declaredValue: data.customs?.items.reduce((sum, item) => sum + item.value, 0) || 0,
            declaredValueCurrency: 'EUR',
            exportDeclaration: data.customs ? {
              lineItems: data.customs.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                value: item.value,
                weight: item.weight,
                commodityCode: item.hsCode
              })),
              incoterm: data.customs.incoterm
            } : undefined
          }
        },
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.siteId}:${this.password}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        trackingNumber: response.data.shipmentTrackingNumber,
        label: response.data.documents.find((doc: any) => doc.typeCode === 'label').content,
        customsDocuments: response.data.documents
          .filter((doc: any) => doc.typeCode === 'customs')
          .map((doc: any) => doc.content)
      };
    } catch (error) {
      console.error('Error generating DHL label:', error);
      throw new Error('Failed to generate shipping label');
    }
  }

  async trackShipment(trackingNumber: string): Promise<DHLTrackingEvent[]> {
    try {
      await this.ensureCredentials();

      const response = await axios.get(
        `${this.baseUrl}/tracking/${trackingNumber}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.siteId}:${this.password}`).toString('base64')}`
          }
        }
      );

      return response.data.shipments[0].events.map((event: any) => ({
        timestamp: event.timestamp,
        location: event.location.address.addressLocality,
        status: event.statusCode,
        description: event.description
      }));
    } catch (error) {
      console.error('Error tracking DHL shipment:', error);
      throw new Error('Failed to track shipment');
    }
  }
}

export const dhl = new DHLService();