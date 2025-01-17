import axios from 'axios';
import { supabase } from '../supabaseClient';

// Types pour l'API Colissimo
interface ColissimoLabel {
  parcelNumber: string;
  label: string; // Base64
  cn23: string | null; // Base64, pour les envois internationaux
}

interface ColissimoTrackingEvent {
  date: string;
  status: string;
  location: string;
  message: string;
}

// Service Colissimo
export class ColissimoService {
  private baseUrl: string;
  private contractNumber: string | null = null;
  private password: string | null = null;

  constructor() {
    this.baseUrl = 'https://ws.colissimo.fr';
  }

  // Charger les identifiants depuis la base de données
  private async loadCredentials() {
    const { data, error } = await supabase
      .from('carrier_settings')
      .select('contract_number, api_secret')
      .eq('carrier_id', 'COLISSIMO')
      .single();

    if (error) throw error;
    if (!data?.contract_number || !data?.api_secret) {
      throw new Error('Colissimo credentials not configured');
    }

    this.contractNumber = data.contract_number;
    this.password = data.api_secret;
  }

  // Vérifier que les identifiants sont chargés
  private async ensureCredentials() {
    if (!this.contractNumber || !this.password) {
      await this.loadCredentials();
    }
  }

  // Générer une étiquette d'expédition
  async generateLabel(data: {
    weight: number;
    sender: {
      name: string;
      street: string;
      city: string;
      zipCode: string;
      countryCode: string;
      email: string;
      phone?: string;
    };
    recipient: {
      name: string;
      street: string;
      city: string;
      zipCode: string;
      countryCode: string;
      email: string;
      phone?: string;
    };
    productCode: string;
    orderNumber: string;
    returnReceipt?: boolean;
  }): Promise<ColissimoLabel> {
    try {
      await this.ensureCredentials();

      const response = await axios.post(`${this.baseUrl}/sls-ws/SlsServiceWS/generateLabel`, {
        contractNumber: this.contractNumber,
        password: this.password,
        outputFormat: {
          x: 0,
          y: 0,
          outputPrintingType: 'PDF_10x15_300dpi'
        },
        letter: {
          service: {
            productCode: data.productCode,
            depositDate: new Date().toISOString().split('T')[0],
            orderNumber: data.orderNumber,
            commercialName: data.sender.name,
            returnReceipt: data.returnReceipt || false
          },
          parcel: {
            weight: data.weight
          },
          sender: {
            senderParcelRef: data.orderNumber,
            address: {
              companyName: data.sender.name,
              line2: data.sender.street,
              city: data.sender.city,
              zipCode: data.sender.zipCode,
              countryCode: data.sender.countryCode,
              email: data.sender.email,
              mobileNumber: data.sender.phone
            }
          },
          addressee: {
            addresseeParcelRef: data.orderNumber,
            address: {
              lastName: data.recipient.name,
              line2: data.recipient.street,
              city: data.recipient.city,
              zipCode: data.recipient.zipCode,
              countryCode: data.recipient.countryCode,
              email: data.recipient.email,
              mobileNumber: data.recipient.phone
            }
          }
        }
      });

      if (response.data.messages?.length > 0) {
        throw new Error(response.data.messages[0].messageContent);
      }

      return {
        parcelNumber: response.data.labelResponse.parcelNumber,
        label: response.data.labelResponse.label,
        cn23: response.data.labelResponse.cn23 || null
      };
    } catch (error) {
      console.error('Error generating Colissimo label:', error);
      throw new Error('Failed to generate shipping label');
    }
  }

  // Suivre un colis
  async trackParcel(trackingNumber: string): Promise<ColissimoTrackingEvent[]> {
    try {
      await this.ensureCredentials();

      const response = await axios.post(`${this.baseUrl}/tracking-ws/TrackingServiceWS/track`, {
        contractNumber: this.contractNumber,
        password: this.password,
        skybillNumber: trackingNumber,
        lang: 'FR'
      });

      if (response.data.messages?.length > 0) {
        throw new Error(response.data.messages[0].messageContent);
      }

      return response.data.events.map((event: any) => ({
        date: event.date,
        status: event.status,
        location: event.site || '',
        message: event.message
      }));
    } catch (error) {
      console.error('Error tracking Colissimo parcel:', error);
      throw new Error('Failed to track parcel');
    }
  }

  // Créer une expédition dans notre système
  async createShipment(data: {
    orderId: string;
    weight: number;
    recipient: {
      name: string;
      street: string;
      city: string;
      zipCode: string;
      countryCode: string;
      email: string;
      phone?: string;
    };
  }) {
    try {
      // Récupérer les informations de l'expéditeur depuis Supabase
      const { data: senderData, error: senderError } = await supabase
        .from('warehouse_settings')
        .select('*')
        .single();

      if (senderError) throw senderError;

      // Générer l'étiquette Colissimo
      const label = await this.generateLabel({
        weight: data.weight,
        sender: {
          name: senderData.name,
          street: senderData.street,
          city: senderData.city,
          zipCode: senderData.zipCode,
          countryCode: senderData.countryCode,
          email: senderData.email,
          phone: senderData.phone
        },
        recipient: data.recipient,
        productCode: 'DOM',
        orderNumber: data.orderId
      });

      // Créer l'expédition dans Supabase
      const { error: shipmentError } = await supabase
        .from('shipments')
        .insert([{
          order_id: data.orderId,
          carrier_id: 'COLISSIMO',
          tracking_number: label.parcelNumber,
          status: 'label_created',
          weight: data.weight,
          label_url: label.label, // On stocke le PDF en base64
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (shipmentError) throw shipmentError;

      return label.parcelNumber;
    } catch (error) {
      console.error('Error creating Colissimo shipment:', error);
      throw new Error('Failed to create shipment');
    }
  }

  // Mettre à jour le statut d'une expédition
  async updateShipmentStatus(shipmentId: string) {
    try {
      // Récupérer l'expédition
      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .select('tracking_number')
        .eq('id', shipmentId)
        .single();

      if (shipmentError) throw shipmentError;

      // Récupérer les événements de suivi
      const events = await this.trackParcel(shipment.tracking_number);
      
      if (events.length === 0) return;

      // Ajouter les nouveaux événements
      const { error: eventError } = await supabase
        .from('shipment_events')
        .insert(
          events.map(event => ({
            shipment_id: shipmentId,
            status: event.status,
            location: event.location,
            description: event.message,
            occurred_at: event.date
          }))
        );

      if (eventError) throw eventError;

      // Mettre à jour le statut de l'expédition
      const lastEvent = events[0];
      let newStatus: string;

      switch (lastEvent.status) {
        case 'LIVRE':
          newStatus = 'delivered';
          break;
        case 'EN_COURS_DE_LIVRAISON':
          newStatus = 'in_transit';
          break;
        case 'PRIS_EN_CHARGE':
          newStatus = 'picked_up';
          break;
        default:
          newStatus = 'in_transit';
      }

      const { error: updateError } = await supabase
        .from('shipments')
        .update({
          status: newStatus,
          actual_delivery: newStatus === 'delivered' ? lastEvent.date : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', shipmentId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating Colissimo shipment status:', error);
      throw new Error('Failed to update shipment status');
    }
  }
}

// Export une instance par défaut
export const colissimo = new ColissimoService();