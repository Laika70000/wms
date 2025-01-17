import axios from 'axios';
import { supabase } from '../supabaseClient';

interface UPSLabel {
  trackingNumber: string;
  label: string; // Base64
  customsDocuments?: string[]; // Base64
}

interface UPSTrackingEvent {
  date: string;
  time: string;
  status: string;
  location: string;
  description: string;
}

export class UPSService {
  private baseUrl: string;
  private accessKey: string | null = null;
  private accountNumber: string | null = null;
  private secretKey: string | null = null;

  constructor() {
    this.baseUrl = 'https://api-mock.ups.com/api';
  }

  private async loadCredentials() {
    const { data, error } = await supabase
      .from('carrier_settings')
      .select('api_key, api_secret, contract_number')
      .eq('carrier_id', 'UPS')
      .single();

    if (error) throw error;
    if (!data?.api_key || !data?.api_secret || !data?.contract_number) {
      throw new Error('UPS credentials not configured');
    }

    this.accessKey = data.api_key;
    this.secretKey = data.api_secret;
    this.accountNumber = data.contract_number;
  }

  private async ensureCredentials() {
    if (!this.accessKey || !this.secretKey || !this.accountNumber) {
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
      code: string;
      options?: string[];
    };
    reference?: string;
  }): Promise<UPSLabel> {
    try {
      await this.ensureCredentials();

      const response = await axios.post(
        `${this.baseUrl}/shipments/v1/shipping/shipments`,
        {
          ShipmentRequest: {
            Request: {
              RequestOption: ['validate'],
              TransactionReference: {
                CustomerContext: data.reference
              }
            },
            Shipment: {
              Description: 'Shipment',
              Shipper: {
                Name: data.sender.name,
                AttentionName: data.sender.company,
                Phone: {
                  Number: data.sender.phone
                },
                ShipperNumber: this.accountNumber,
                Address: {
                  AddressLine: data.sender.street,
                  City: data.sender.city,
                  StateProvinceCode: data.sender.state,
                  PostalCode: data.sender.postalCode,
                  CountryCode: data.sender.country
                }
              },
              ShipTo: {
                Name: data.recipient.name,
                AttentionName: data.recipient.company,
                Phone: {
                  Number: data.recipient.phone
                },
                Address: {
                  AddressLine: data.recipient.street,
                  City: data.recipient.city,
                  StateProvinceCode: data.recipient.state,
                  PostalCode: data.recipient.postalCode,
                  CountryCode: data.recipient.country
                }
              },
              Service: {
                Code: data.service.code
              },
              Package: {
                PackagingType: {
                  Code: '02'
                },
                Dimensions: data.shipmentDetails.dimensions ? {
                  UnitOfMeasurement: {
                    Code: 'CM'
                  },
                  Length: data.shipmentDetails.dimensions.length,
                  Width: data.shipmentDetails.dimensions.width,
                  Height: data.shipmentDetails.dimensions.height
                } : undefined,
                PackageWeight: {
                  UnitOfMeasurement: {
                    Code: 'KGS'
                  },
                  Weight: data.shipmentDetails.weight
                }
              }
            },
            LabelSpecification: {
              LabelImageFormat: {
                Code: 'GIF'
              }
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        trackingNumber: response.data.ShipmentResponse.ShipmentResults.ShipmentIdentificationNumber,
        label: response.data.ShipmentResponse.ShipmentResults.PackageResults.ShippingLabel.GraphicImage
      };
    } catch (error) {
      console.error('Error generating UPS label:', error);
      throw new Error('Failed to generate shipping label');
    }
  }

  async trackShipment(trackingNumber: string): Promise<UPSTrackingEvent[]> {
    try {
      await this.ensureCredentials();

      const response = await axios.post(
        `${this.baseUrl}/track/v1/details/${trackingNumber}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.accessKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.trackResponse.shipment[0].package[0].activity.map((activity: any) => ({
        date: activity.date,
        time: activity.time,
        status: activity.status.type,
        location: `${activity.location.city}, ${activity.location.countryCode}`,
        description: activity.status.description
      }));
    } catch (error) {
      console.error('Error tracking UPS shipment:', error);
      throw new Error('Failed to track shipment');
    }
  }
}

export const ups = new UPSService();