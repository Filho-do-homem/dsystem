
export interface Product {
  id: string;
  name: string;
  type: string; // e.g., Candle, Cream, Perfume
  barcode?: string; // Optional barcode field
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

export interface Nota {
  id: string;
  productId: string;
  productName: string; // Denormalized for display convenience
  quantity: number; // Quantity of product added via this note
  noteNumber?: string; // Optional: e.g., invoice number, batch number
  date: string; // ISO date string of the note event
  createdAt: string; // ISO date string of record creation
}

// For dashboard summary cards
export interface SummaryCardData {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}

// For items scanned via barcode in the sales page
export interface ScannedItem {
  product: Product;
  quantity: number;
}
