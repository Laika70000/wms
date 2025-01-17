import React, { useState } from 'react';
import { X, Download, Printer } from 'lucide-react';
import { generateLabel, downloadLabel } from '../../services/carriers/labelService';

interface ShippingLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
}

const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({
  isOpen,
  onClose,
  shipmentId
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labelUrl, setLabelUrl] = useState<string | null>(null);

  const handleGenerateLabel = async () => {
    try {
      setLoading(true);
      setError(null);
      const label = await generateLabel(shipmentId);
      setLabelUrl(label.label);
    } catch (err) {
      console.error('Error generating label:', err);
      setError('Erreur lors de la génération de l\'étiquette');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const base64Pdf = await downloadLabel(shipmentId);
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${base64Pdf}`;
      link.download = `shipping-label-${shipmentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading label:', err);
      setError('Erreur lors du téléchargement de l\'étiquette');
    }
  };

  const handlePrint = async () => {
    try {
      const base64Pdf = await downloadLabel(shipmentId);
      const blob = await fetch(`data:application/pdf;base64,${base64Pdf}`).then(res => res.blob());
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);
      printWindow?.print();
    } catch (err) {
      console.error('Error printing label:', err);
      setError('Erreur lors de l\'impression de l\'étiquette');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Étiquette d'expédition</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {!labelUrl ? (
            <div className="text-center py-8">
              <button
                onClick={handleGenerateLabel}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Génération...' : 'Générer l\'étiquette'}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 aspect-[1/1.4] bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={`data:application/pdf;base64,${labelUrl}`}
                  className="w-full h-full"
                  title="Étiquette d'expédition"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingLabelModal;