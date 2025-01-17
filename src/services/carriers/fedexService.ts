import axios from 'axios';
import { supabase } from '../supabaseClient';

interface FedExLabel {
  trackingNumber: string;
  label: string; // Base64
  customsDocuments?: string[]; // Base64
}

interface FedExTrackingEvent {
  timestamp: string;
  eventType: string;
  eventDescription: string;
  address: {
    city: string;
    stateOrProvinceCode: string;
    countryCode: string;
  };
}

export class FedExService {
  private baseUrl: string;
  private apiKey: string | null = null;
  private secretKey: string | null = null;
  private accountNumber: string | null = null;

  constructor() {
    this.baseUrl = 'https://apis-sandbox.fedex.com';
  }

  private async loadCredentials() {
    const { data, error } = await supabase
      .from('carrier_settings')
      .select('api_key, api_secret, contract_number')
      .eq('carrier_id', 'FEDEX')
      .single();

    if (error) throw error;
    if (!data?.api_key || !data?.api_secret || !data?.contract_number) {
      throw new Error('FedEx credentials not configured');
    }

    this.apiKey = data.api_key;
    this.secretKey = data.api_secret;
    this.accountNumber = data.contract_number;
  }

  private async ensureCredentials() {
    if (!this.apiKey || !this.secretKey || !this.accountNumber) {
      await this.loadCredentials();
    }
  }

  private async getAccessToken(): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/oauth/token`,
      {
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.secretKey
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
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
      state: string;
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
      state: string;
      postalCode: string;
      country: string;
      email: string;
      phone?: string;
    };
    service: {
      type: string;
      options?: string[];
    };
    reference?: string;
  }): Promise<FedExLabel> {
    try {
      await this.ensureCredentials();
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/ship/v1/shipments`,
        {
          requestedShipment: {
            shipper: {
              contact: {
                personName: data.sender.name,
                phoneNumber: data.sender.phone,
                companyName: data.sender.company,
                emailAddress: data.sender.email
              },
              address: {
                streetLines: [data.sender.street],
                city: data.sender.city,
                stateOrProvinceCode: data.sender.state,
                postalCode: data.sender.postalCode,
                countryCode: data.sender.country
              }
            },
            recipients: [
              {
                contact: {
                  personName: data.recipient.name,
                  phoneNumber: data.recipient.phone,
                  companyName: data.recipient.company,
                  emailAddress: data.recipient.email
                },
                address: {
                  streetLines: [data.recipient.street],
                  city: data.recipient.city,
                  stateOrProvinceCode: data.recipient.state,
                  postalCode: data.recipient.postalCode,
                  countryCode: data.recipient.country
                }
              }
            ],
            shipDatestamp: new Date().toISOString().split('T')[0],
            serviceType: data.service.type,
            packagingType: 'YOUR_PACKAGING',
            requestedPackageLineItems: [
              {
                weight: {
                  units: 'KG',
                  value: data.shipmentDetails.weight
                },
                dimensions: data.shipmentDetails.dimensions ? {
                  length: data.shipmentDetails.dimensions.length,
                  width: data.shipmentDetails.dimensions.width,
                  height: data.shipmentDetails.dimensions.height,
                  units: 'CM'
                } : undefined
              }
            ],
            labelSpecification: {
              imageType: 'PDF',
              labelStockType: 'PAPER_85X11_TOP_HALF_LABEL'
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        trackingNumber: response.data.output.transactionShipments[0].masterTrackingNumber,
        label: response.data.output.transactionShipments[0].pieceResponses[0].packageDocuments[0].url
      };
    } catch (error) {
      console.error('Error generating FedEx label:', error);
      throw new Error('Failed to generate shipping label');
    }
  }

  async trackShipment(trackingNumber: string): Promise<FedExTrackingEvent[]> {
    try {
      await this.ensureCredentials();
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/track/v1/trackingnumbers`,
        {
          trackingInfo: [
            {
              trackingNumberInfo: {
                trackingNumber: trackingNumber
              }
            }
          ],
          includeDetailedScans: true
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.output[0].trackResults[0].scanEvents.map((event: any) => ({
        timestamp: event.date,
        eventType: event.eventType,
        eventDescription: event.eventDescription,
        address: {
          city: event.scanLocation.city,
          stateOrProvinceCode: event.scanLocation.stateOrProvinceCode,
          countryCode: event.scanLocation.countryCode
        }
      }));
    } catch (error) {
      console.error('Error tracking FedEx shipment:', error);
      throw new Error('Failed to track shipment');
    }
  }
}

export const fedex = new FedExService();