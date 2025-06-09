
export interface Product {
  id: string;
  name: string;
  type: string; // e.g., Candle, Cream, Perfume
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  createdAt: string; // ISO date string
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName?: string; // Denormalized for display convenience
  quantityChange: number; // Positive for adding stock, negative for reduction
  reason: string; // e.g., "Initial Stock", "New Batch", "Correction", "Damaged", "Return"
  date: string; // ISO date string
  createdAt: string; // ISO date string
}

export interface Sale {
  id: string;
  productId: string;
  productName?: string; // Denormalized for display convenience
  quantitySold: number;
  pricePerItem: number; // Selling price at time of sale
  totalAmount: number; // quantitySold * pricePerItem
  saleDate: string; // ISO date string
  createdAt: string; // ISO date string
}

// For dashboard summary cards
export interface SummaryCardData {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}
