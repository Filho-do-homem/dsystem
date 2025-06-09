import type { Product, StockAdjustment, Sale } from '@/types';
import { generateId } from './utils';

const today = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Vela Sonho de Lavanda',
    type: 'Vela',
    costPrice: 5.00,
    sellingPrice: 15.00,
    currentStock: 0, // Initialized by the IIFE below
    createdAt: twoDaysAgo,
  },
  {
    id: 'prod_2',
    name: 'Creme de Mãos Manteiga de Karité',
    type: 'Creme',
    costPrice: 3.50,
    sellingPrice: 12.00,
    currentStock: 0, // Initialized by the IIFE below
    createdAt: yesterday,
  },
  {
    id: 'prod_3',
    name: 'Perfume Pétalas de Rosa',
    type: 'Perfume',
    costPrice: 8.00,
    sellingPrice: 25.00,
    currentStock: 0, // Initialized by the IIFE below
    createdAt: today,
  },
  {
    id: 'prod_4',
    name: 'Sabonete Fava de Baunilha',
    type: 'Sabonete',
    costPrice: 2.00,
    sellingPrice: 8.00,
    currentStock: 0, // Initialized by the IIFE below
    createdAt: twoDaysAgo,
  },
];

export const MOCK_STOCK_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: generateId(),
    productId: 'prod_1',
    productName: 'Vela Sonho de Lavanda',
    quantityChange: 50,
    reason: 'Estoque Inicial',
    date: twoDaysAgo,
    createdAt: twoDaysAgo,
  },
  {
    id: generateId(),
    productId: 'prod_2',
    productName: 'Creme de Mãos Manteiga de Karité',
    quantityChange: 30,
    reason: 'Estoque Inicial',
    date: yesterday,
    createdAt: yesterday,
  },
   {
    id: generateId(),
    productId: 'prod_3',
    productName: 'Perfume Pétalas de Rosa',
    quantityChange: 20,
    reason: 'Estoque Inicial',
    date: today,
    createdAt: today,
  },
  {
    id: generateId(),
    productId: 'prod_4',
    productName: 'Sabonete Fava de Baunilha',
    quantityChange: 75,
    reason: 'Estoque Inicial',
    date: twoDaysAgo,
    createdAt: twoDaysAgo,
  },
  {
    id: generateId(),
    productId: 'prod_1',
    productName: 'Vela Sonho de Lavanda',
    quantityChange: 25,
    reason: 'Novo Lote',
    date: today,
    createdAt: today,
  },
];

export const MOCK_SALES: Sale[] = [
  {
    id: generateId(),
    productId: 'prod_1',
    productName: 'Vela Sonho de Lavanda',
    quantitySold: 2,
    pricePerItem: 15.00,
    totalAmount: 30.00,
    saleDate: yesterday,
    createdAt: yesterday,
  },
  {
    id: generateId(),
    productId: 'prod_2',
    productName: 'Creme de Mãos Manteiga de Karité',
    quantitySold: 1,
    pricePerItem: 12.00,
    totalAmount: 12.00,
    saleDate: today,
    createdAt: today,
  },
  {
    id: generateId(),
    productId: 'prod_4',
    productName: 'Sabonete Fava de Baunilha',
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

  // Initialize stock based on "Estoque Inicial" adjustments
  MOCK_STOCK_ADJUSTMENTS.forEach(adj => {
    if (adj.reason === 'Estoque Inicial') {
      productStockMap.set(adj.productId, (productStockMap.get(adj.productId) || 0) + adj.quantityChange);
    }
  });
  
  // Set initial stock for products
  MOCK_PRODUCTS.forEach(p => {
    p.currentStock = productStockMap.get(p.id) || 0;
  });

  // Apply other stock adjustments (non "Estoque Inicial")
  MOCK_STOCK_ADJUSTMENTS.forEach(adj => {
     if (adj.reason !== 'Estoque Inicial') {
        const product = MOCK_PRODUCTS.find(p => p.id === adj.productId);
        if (product) {
            product.currentStock += adj.quantityChange;
        }
     }
  });

  // Deduct sales from stock
  MOCK_SALES.forEach(sale => {
    const product = MOCK_PRODUCTS.find(p => p.id === sale.productId);
    if (product) {
      product.currentStock -= sale.quantitySold;
    }
  });
})();
