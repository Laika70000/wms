import React, { useState } from 'react';
import { X, Store, ShoppingBag } from 'lucide-react';
import { Source, Platform } from '../../types/sources';
import { toast } from 'react-hot-toast';

interface SourceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (source: Source) => Promise<void>;
}

const SourceForm: React.FC<SourceFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'shopify' as Platform,
    name: '',
    apiKey: '',
    apiSecret: '',
    shopUrl: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Validation
      if (formData.platform === 'shopify') {
        if (!formData.shopUrl) {
          toast.error('Shop URL is required for Shopify stores');
          return;
        }

        // Basic URL format validation
        const urlPattern = /^(?:https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?$/i;
        if (!urlPattern.test(formData.shopUrl)) {
          toast.error('Please enter a valid shop URL');
          return;
        }
      }

      if (!formData.apiKey || !formData.apiSecret) {
        toast.error('API credentials are required');
        return;
      }

      // Clean shop URL format
      let cleanShopUrl = formData.shopUrl;
      if (formData.platform === 'shopify') {
        cleanShopUrl = formData.shopUrl
          .replace(/^https?:\/\//, '')
          .replace(/\/$/, '');
          
        // Ensure .myshopify.com domain
        if (!cleanShopUrl.includes('.myshopify.com')) {
          cleanShopUrl += '.myshopify.com';
        }
      }

      const source: Source = {
        id: Date.now().toString(), // Temporary ID
        platform: formData.platform,
        name: formData.name || `${formData.platform} Store`,
        apiKey: formData.apiKey,
        apiSecret: formData.apiSecret,
        shopUrl: cleanShopUrl,
        status: 'pending',
        lastSync: null
      };

      await onSubmit(source);
      
      // Reset form
      setFormData({
        platform: 'shopify',
        name: '',
        apiKey: '',
        apiSecret: '',
        shopUrl: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding source:', error);
      toast.error('Failed to add source. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Add New Source</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, platform: 'shopify' })}
                  className={`flex items-center gap-2 p-3 rounded-lg border ${
                    formData.platform === 'shopify'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Store className="w-5 h-5 text-[#96BF47]" />
                  <span>Shopify</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, platform: 'amazon' })}
                  className={`flex items-center gap-2 p-3 rounded-lg border ${
                    formData.platform === 'amazon'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 text-[#FF9900]" />
                  <span>Amazon</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name (Optional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="My Store"
              />
            </div>

            {formData.platform === 'shopify' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop URL *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.shopUrl}
                    onChange={(e) => setFormData({ ...formData, shopUrl: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="mystore"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    .myshopify.com
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your Shopify store name without .myshopify.com
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token *
              </label>
              <input
                type="text"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="shpat_xxxxx..."
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Your Shopify Admin API access token
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Secret *
              </label>
              <input
                type="password"
                value={formData.apiSecret}
                onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SourceForm;