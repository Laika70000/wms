import supabase from '../../../services/supabaseClient';
import { showError, showSuccess } from '../../../utils/errorHandler';

export const importProducts = async (file: File): Promise<void> => {
  try {
    const text = await file.text();
    const rows = text.split('\n');
    
    // Skip empty rows and trim whitespace
    const validRows = rows.filter(row => row.trim());
    if (validRows.length < 2) {
      throw new Error('Le fichier est vide ou ne contient que l\'en-tête');
    }

    // Parse header (support both ; and , as separators)
    const separator = validRows[0].includes(';') ? ';' : ',';
    const headers = validRows[0].split(separator).map(h => h.trim());
    const requiredHeaders = ['name', 'sku', 'category', 'price'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Colonnes manquantes : ${missingHeaders.join(', ')}`);
    }

    // Parse and validate data rows
    const products = validRows.slice(1)
      .map((row, index) => {
        const values = row.split(separator).map(v => v.trim());
        if (values.length !== headers.length) {
          throw new Error(`Ligne ${index + 2}: nombre de colonnes incorrect`);
        }

        const product = {
          name: values[headers.indexOf('name')],
          sku: values[headers.indexOf('sku')],
          category: values[headers.indexOf('category')],
          price: parseFloat(values[headers.indexOf('price')]) || 0,
          description: headers.includes('description') ? values[headers.indexOf('description')] : null,
          weight: headers.includes('weight') ? parseFloat(values[headers.indexOf('weight')]) || null : null,
          width: headers.includes('width') ? parseFloat(values[headers.indexOf('width')]) || null : null,
          height: headers.includes('height') ? parseFloat(values[headers.indexOf('height')]) || null : null,
          depth: headers.includes('depth') ? parseFloat(values[headers.indexOf('depth')]) || null : null,
          min_stock: headers.includes('minStock') ? parseInt(values[headers.indexOf('minStock')]) || 0 : 0
        };

        // Validate required fields
        if (!product.name || !product.sku || !product.category) {
          throw new Error(`Ligne ${index + 2}: nom, SKU et catégorie sont requis`);
        }

        // Validate numeric fields
        if (isNaN(product.price) || product.price < 0) {
          throw new Error(`Ligne ${index + 2}: prix invalide`);
        }

        return product;
      });

    // Insert products in batches
    const batchSize = 25;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const { error } = await supabase
        .from('products')
        .insert(batch);

      if (error) {
        if (error.code === '23505') {
          throw new Error('Un ou plusieurs SKU existent déjà');
        }
        throw error;
      }

      // Add a small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    showSuccess(`${products.length} produits importés avec succès`);
  } catch (error) {
    showError(error);
    throw error;
  }
};