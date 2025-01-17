import { supabase } from '../supabaseClient';
import { colissimo } from './colissimoService';
import { dhl } from './dhlService';
import { ups } from './upsService';
import { fedex } from './fedexService';
import { chronopost } from './chronopostService';
import { mondialRelay } from './mondialRelayService';

export interface ShippingLabel {
  trackingNumber: string;
  label: string; // Base64 PDF
  customsDocuments?: string[]; // Base64 PDFs
}

export const generateLabel = async (shipmentId: string): Promise<ShippingLabel> => {
  try {
    // Récupérer les informations de l'expédition
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select(`
        *,
        order:orders(*),
        carrier:carriers(*)
      `)
      .eq('id', shipmentId)
      .single();

    if (shipmentError) throw shipmentError;

    // Récupérer les paramètres du transporteur
    const { data: settings, error: settingsError } = await supabase
      .from('carrier_settings')
      .select('*')
      .eq('carrier_id', shipment.carrier_id)
      .single();

    if (settingsError) throw settingsError;

    // Générer l'étiquette selon le transporteur
    let label: ShippingLabel;
    switch (shipment.carrier.code) {
      case 'COLISSIMO':
        label = await colissimo.generateLabel({
          weight: shipment.weight,
          sender: {
            name: shipment.order.merchant_name,
            street: shipment.order.merchant_address,
            city: shipment.order.merchant_city,
            zipCode: shipment.order.merchant_postal_code,
            countryCode: shipment.order.merchant_country,
            email: shipment.order.merchant_email
          },
          recipient: {
            name: shipment.order.customer_name,
            street: shipment.order.shipping_address.street,
            city: shipment.order.shipping_address.city,
            zipCode: shipment.order.shipping_address.postal_code,
            countryCode: shipment.order.shipping_address.country,
            email: shipment.order.email
          },
          orderNumber: shipment.order.order_number
        });
        break;

      // Ajouter les autres transporteurs ici...
      default:
        throw new Error(`Transporteur non supporté: ${shipment.carrier.code}`);
    }

    // Sauvegarder l'étiquette et le numéro de suivi
    const { error: updateError } = await supabase
      .from('shipments')
      .update({
        tracking_number: label.trackingNumber,
        label_url: label.label,
        status: 'label_created',
        updated_at: new Date().toISOString()
      })
      .eq('id', shipmentId);

    if (updateError) throw updateError;

    return label;
  } catch (error) {
    console.error('Error generating shipping label:', error);
    throw error;
  }
};

export const downloadLabel = async (shipmentId: string): Promise<string> => {
  const { data: shipment, error } = await supabase
    .from('shipments')
    .select('label_url')
    .eq('id', shipmentId)
    .single();

  if (error) throw error;
  if (!shipment.label_url) throw new Error('Étiquette non disponible');

  return shipment.label_url;
};