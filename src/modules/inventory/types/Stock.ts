export interface StockMovement {
  id: string;
  productId: string;
  locationId: string;
  type: 'reception' | 'adjustment' | 'transfer';
  quantity: number;
  reference?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface ProductStock {
  totalQuantity: number;
  locations: {
    location: {
      id: string;
      aisle: string;
      section: string;
      shelf: string;
    };
    quantity: number;
  }[];
}