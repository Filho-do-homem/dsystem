
import type { Product, StockAdjustment, Sale, Nota } from '@/types';
import { generateId } from './utils';

const today = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Vela Sonho de Lavanda',
    type: 'Vela',
    barcode: '1234567890123',
    costPrice: 5.00,
    sellingPrice: 15.00,
    currentStock: 0, 
    createdAt: twoDaysAgo,
  },
  {
    id: 'prod_2',
    name: 'Creme de Mãos Manteiga de Karité',
    type: 'Creme',
    barcode: '2345678901234',
    costPrice: 3.50,
    sellingPrice: 12.00,
    currentStock: 0, 
    createdAt: yesterday,
  },
  {
    id: 'prod_3',
    name: 'Perfume Pétalas de Rosa',
    type: 'Perfume',
    barcode: '3456789012345',
    costPrice: 8.00,
    sellingPrice: 25.00,
    currentStock: 0, 
    createdAt: today,
  },
  {
    id: 'prod_4',
    name: 'Sabonete Fava de Baunilha',
    type: 'Sabonete',
    barcode: '4567890123456',
    costPrice: 2.00,
    sellingPrice: 8.00,
    currentStock: 0, 
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

export const MOCK_NOTAS: Nota[] = [
  {
    id: generateId(),
    productId: 'prod_1',
    productName: 'Vela Sonho de Lavanda',
    quantity: 10,
    noteNumber: 'NF-001',
    date: threeDaysAgo,
    createdAt: threeDaysAgo,
  },
  {
    id: generateId(),
    productId: 'prod_2',
    productName: 'Creme de Mãos Manteiga de Karité',
    quantity: 15,
    noteNumber: 'BATCH-PROD-005',
    date: yesterday,
    createdAt: yesterday,
  }
];


// Initialize MOCK_PRODUCTS currentStock based on adjustments and sales
(() => {
  const productStockMap = new Map<string, number>();

  MOCK_PRODUCTS.forEach(p => {
    productStockMap.set(p.id, 0); // Start with 0 stock
  });
  
  // Apply all stock adjustments (Initial Stock, New Batch, etc.)
  MOCK_STOCK_ADJUSTMENTS.forEach(adj => {
    productStockMap.set(adj.productId, (productStockMap.get(adj.productId) || 0) + adj.quantityChange);
  });

  // Apply stock entries from Notas
  MOCK_NOTAS.forEach(nota => {
    const existingAdjustmentForNota = MOCK_STOCK_ADJUSTMENTS.find(
      sa => sa.productId === nota.productId && sa.date === nota.date && sa.quantityChange === nota.quantity && sa.reason === "Entrada por Nota"
    );
    if (!existingAdjustmentForNota) {
        const stockAdjustmentFromNota: StockAdjustment = {
            id: generateId(),
            productId: nota.productId,
            productName: nota.productName,
            quantityChange: nota.quantity,
            reason: "Entrada por Nota",
            date: nota.date,
            createdAt: nota.createdAt,
        };
        MOCK_STOCK_ADJUSTMENTS.push(stockAdjustmentFromNota);
        productStockMap.set(nota.productId, (productStockMap.get(nota.productId) || 0) + nota.quantity);
    }
  });

  // Deduct sales from stock
  MOCK_SALES.forEach(sale => {
    productStockMap.set(sale.productId, (productStockMap.get(sale.productId) || 0) - sale.quantitySold);
    // Add stock adjustment for sale
    const saleAdjustment: StockAdjustment = {
      id: generateId(),
      productId: sale.productId,
      productName: sale.productName,
      quantityChange: -sale.quantitySold,
      reason: `Venda ID: ${sale.id.substring(0,4)}`,
      date: sale.saleDate,
      createdAt: sale.createdAt,
    };
    MOCK_STOCK_ADJUSTMENTS.push(saleAdjustment);
  });

  // Update product currentStock
  MOCK_PRODUCTS.forEach(p => {
    p.currentStock = productStockMap.get(p.id) || 0;
  });
})();
