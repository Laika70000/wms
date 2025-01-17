import axios from 'axios';
import { createHash } from 'crypto';
import { supabase } from '../supabaseClient';

interface MondialRelayLabel {
  expeditionNumber: string;
  trackingNumber: string;
  label: string; // Base64 PDF
}

interface MondialRelayTrackingEvent {
  date: string;
  status: string;
  location: string;
  relayPoint?: {
    id: string;
    name: string;
    address: string;
  };
}

export class MondialRelayService {
  private baseUrl: string;
  private merchantId: string | null = null;
  private privateKey: string | null = null;

  constructor() {
    this.baseUrl = 'https://api.mondialrelay.com/Web_Services.asmx';
  }

  private async loadCredentials() {
    const { data, error } = await supabase
      .from('carrier_settings')
      .select('contract_number, api_secret')
      .eq('carrier_id', 'MONDIAL_RELAY')
      .single();

    if (error) throw error;
    if (!data?.contract_number || !data?.api_secret) {
      throw new Error('Mondial Relay credentials not configured');
    }

    this.merchantId = data.contract_number;
    this.privateKey = data.api_secret;
  }

  private async ensureCredentials() {
    if (!this.merchantId || !this.privateKey) {
      await this.loadCredentials();
    }
  }

  private generateSecurityKey(params: string[]): string {
    const concatenatedString = params.join('') + this.privateKey;
    return createHash('md5').update(concatenatedString).digest('hex').toUpperCase();
  }

  async generateLabel(data: {
    pickupPoint: string;
    weight: number;
    sender: {
      name: string;
      street: string;
      city: string;
      postalCode: string;
      country: string;
      email: string;
      phone?: string;
    };
    recipient: {
      name: string;
      street: string;
      city: string;
      postalCode: string;
      country: string;
      email: string;
      phone?: string;
    };
    reference?: string;
  }): Promise<MondialRelayLabel> {
    try {
      await this.ensureCredentials();

      // Paramètres pour la génération du code de sécurité
      const securityParams = [
        this.merchantId,
        data.sender.name,
        data.sender.street,
        data.sender.postalCode,
        data.sender.city,
        data.sender.country,
        data.sender.email,
        data.recipient.name,
        data.recipient.street,
        data.recipient.postalCode,
        data.recipient.city,
        data.recipient.country,
        data.recipient.email,
        data.pickupPoint,
        data.weight.toString(),
        data.reference || ''
      ];

      const response = await axios.post(
        this.baseUrl,
        {
          Enseigne: this.merchantId,
          Security: this.generateSecurityKey(securityParams),
          Expedition: {
            Poids: data.weight * 1000, // Conversion en grammes
            Mode_Livraison: '24R',
            Point_Relais: data.pickupPoint,
            Reference: data.reference || '',
            Expediteur: {
              Nom: data.sender.name,
              Adresse: data.sender.street,
              Ville: data.sender.city,
              CP: data.sender.postalCode,
              Pays: data.sender.country,
              Email: data.sender.email,
              Tel: data.sender.phone || ''
            },
            Destinataire: {
              Nom: data.recipient.name,
              Adresse: data.recipient.street,
              Ville: data.recipient.city,
              CP: data.recipient.postalCode,
              Pays: data.recipient.country,
              Email: data.recipient.email,
              Tel: data.recipient.phone || ''
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/soap+xml'
          }
        }
      );

      return {
        expeditionNumber: response.data.ExpeditionNum,
        trackingNumber: response.data.TrackingNumber,
        label: response.data.URL_Etiquette
      };
    } catch (error) {
      console.error('Error generating Mondial Relay label:', error);
      throw new Error('Failed to generate shipping label');
    }
  }

  async trackShipment(trackingNumber: string): Promise<MondialRelayTrackingEvent[]> {
    try {
      await this.ensureCredentials();

      const securityParams = [
        this.merchantId,
        trackingNumber
      ];

      const response = await axios.post(
        this.baseUrl,
        {
          Enseigne: this.merchantId,
          Security: this.generateSecurityKey(securityParams),
          Expedition: trackingNumber
        },
        {
          headers: {
            'Content-Type': 'application/soap+xml'
          }
        }
      );

      return response.data.Tracing.map((event: any) => ({
        date: event.Date,
        status: event.Status,
        location: event.Libelle,
        relayPoint: event.Point_Relais ? {
          id: event.Point_Relais.ID,
          name: event.Point_Relais.Nom,
          address: `${event.Point_Relais.Adresse}, ${event.Point_Relais.CP} ${event.Point_Relais.Ville}`
        } : undefined
      }));
    } catch (error) {
      console.error('Error tracking Mondial Relay shipment:', error);
      throw new Error('Failed to track shipment');
    }
  }

  async findPickupPoints(params: {
    postalCode: string;
    city?: string;
    country: string;
    weight?: number;
    maxResults?: number;
  }): Promise<Array<{
    id: string;
    name: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    location: {
      latitude: number;
      longitude: number;
    };
    distance: number;
    openingHours: string[];
  }>> {
    try {
      await this.ensureCredentials();

      const securityParams = [
        this.merchant Id,
        params.postalCode,
        params.city || '',
        params.country
      ];

      const response = await axios.post(
        `${this.baseUrl}/WSI4_PointRelais_Recherche`,
        {
          Enseigne: this.merchantId,
          Security: this.generateSecurityKey(securityParams),
          Pays: params.country,
          CP: params.postalCode,
          Ville: params.city || '',
          RayonRecherche: '20',
          NombreResultats: params.maxResults?.toString() || '10',
          Poids: params.weight ? (params.weight * 1000).toString() : ''
        },
        {
          headers: {
            'Content-Type': 'application/soap+xml'
          }
        }
      );

      return response.data.PointsRelais.map((point: any) => ({
        id: point.ID,
        name: point.Nom,
        address: point.Adresse1,
        postalCode: point.CP,
        city: point.Ville,
        country: point.Pays,
        location: {
          latitude: parseFloat(point.Latitude),
          longitude: parseFloat(point.Longitude)
        },
        distance: parseFloat(point.Distance),
        openingHours: [
          point.Horaires_Lundi,
          point.Horaires_Mardi,
          point.Horaires_Mercredi,
          point.Horaires_Jeudi,
          point.Horaires_Vendredi,
          point.Horaires_Samedi,
          point.Horaires_Dimanche
        ]
      }));
    } catch (error) {
      console.error('Error finding Mondial Relay pickup points:', error);
      throw new Error('Failed to find pickup points');
    }
  }
}

export const mondialRelay = new MondialRelayService();