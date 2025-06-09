import type { Product, StockAdjustment, Sale } from '@/types';
import { generateId } from './utils';

const today = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Lavender Dream Candle',
    type: 'Candle',
    costPrice: 5.00,
    sellingPrice: 15.00,
    currentStock: 50,
    createdAt: twoDaysAgo,
  },
  {
    id: 'prod_2',
    name: 'Shea Butter Hand Cream',
    type: 'Cream',
    costPrice: 3.50,
    sellingPrice: 12.00,
    currentStock: 30,
    createdAt: yesterday,
  },
  {
    id: 'prod_3',
    name: 'Rose Petal Perfume',
    type: 'Perfume',
    costPrice: 8.00,
    sellingPrice: 25.00,
    currentStock: 20,
    createdAt: today,
  },
  {
    id: 'prod_4',
    name: 'Vanilla Bean Soap',
    type: 'Soap',
    costPrice: 2.00,
    sellingPrice: 8.00,
    currentStock: 75,
    createdAt: twoDaysAgo,
  },
];

export const MOCK_STOCK_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: generateId(),
    productId: 'prod_1',
    productName: 'Lavender Dream Candle',
    quantityChange: 50,
    reason: 'Initial Stock',
    date: twoDaysAgo,
    createdAt: twoDaysAgo,
  },
  {
    id: generateId(),
    productId: 'prod_2',
    productName: 'Shea Butter Hand Cream',
    quantityChange: 30,
    reason: 'Initial Stock',
    date: yesterday,
    createdAt: yesterday,
  },
   {
    id: generateId(),
    productId: 'prod_3',
    productName: 'Rose Petal Perfume',
    quantityChange: 20,
    reason: 'Initial Stock',
    date: today,
    createdAt: today,
  },
  {
    id: generateId(),
    productId: 'prod_4',
    productName: 'Vanilla Bean Soap',
    quantityChange: 75,
    reason: 'Initial Stock',
    date: twoDaysAgo,
    createdAt: twoDaysAgo,
  },
  {
    id: generateId(),
    productId: 'prod_1',
    productName: 'Lavender Dream Candle',
    quantityChange: 25,
    reason: 'New Batch',
    date: today,
    createdAt: today,
  },
];

export const MOCK_SALES: Sale[] = [
  {
    id: generateId(),
    productId: 'prod_1',
    productName: 'Lavender Dream Candle',
    quantitySold: 2,
    pricePerItem: 15.00,
    totalAmount: 30.00,
    saleDate: yesterday,
    createdAt: yesterday,
  },
  {
    id: generateId(),
    productId: 'prod_2',
    productName: 'Shea Butter Hand Cream',
    quantitySold: 1,
    pricePerItem: 12.00,
    totalAmount: 12.00,
    saleDate: today,
    createdAt: today,
  },
  {
    id: generateId(),
    productId: 'prod_4',
    productName: 'Vanilla Bean Soap',
    quantitySold: 5,
    pricePerItem: 8.00,
    totalAmount: 40.00,
    saleDate: today,
    createdAt: today,
  },
];

// Update MOCK_PRODUCTS currentStock based on MOCK_STOCK_ADJUSTMENTS and MOCK_SALES for consistency
(() => {
  const productStockMap = new Map<string, number>();

  MOCK_STOCK_ADJUSTMENTS.forEach(adj => {
    if (adj.reason === 'Initial Stock') {
      productStockMap.set(adj.productId, (productStockMap.get(adj.productId) || 0) + adj.quantityChange);
    }
  });
  
  MOCK_PRODUCTS.forEach(p => {
    p.currentStock = productStockMap.get(p.id) || 0;
  });

  MOCK_STOCK_ADJUSTMENTS.forEach(adj => {
     if (adj.reason !== 'Initial Stock') {
        const product = MOCK_PRODUCTS.find(p => p.id === adj.productId);
        if (product) {
            product.currentStock += adj.quantityChange;
        }
     }
  });

  MOCK_SALES.forEach(sale => {
    const product = MOCK_PRODUCTS.find(p => p.id === sale.productId);
    if (product) {
      product.currentStock -= sale.quantitySold;
    }
  });
})();
