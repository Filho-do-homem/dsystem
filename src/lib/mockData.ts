
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

export let MOCK_STOCK_ADJUSTMENTS: StockAdjustment[] = [
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

export let MOCK_SALES: Sale[] = [
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

export let MOCK_NOTAS: Nota[] = [
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


// IIFE to initialize/synchronize MOCK_PRODUCTS currentStock and related data
(() => {
  const productLookup = new Map<string, { name: string }>();
  MOCK_PRODUCTS.forEach(p => productLookup.set(p.id, { name: p.name }));

  // Update productNames and filter orphaned data from MOCK_STOCK_ADJUSTMENTS
  const validStockAdjustments: StockAdjustment[] = [];
  MOCK_STOCK_ADJUSTMENTS.forEach(adj => {
    const product = productLookup.get(adj.productId);
    if (product) {
      adj.productName = product.name;
      validStockAdjustments.push(adj);
    }
  });
  MOCK_STOCK_ADJUSTMENTS.length = 0;
  MOCK_STOCK_ADJUSTMENTS.push(...validStockAdjustments);

  // Update productNames and filter orphaned data from MOCK_SALES
  const validSales: Sale[] = [];
  MOCK_SALES.forEach(sale => {
    const product = productLookup.get(sale.productId);
    if (product) {
      sale.productName = product.name;
      validSales.push(sale);
    }
  });
  MOCK_SALES.length = 0;
  MOCK_SALES.push(...validSales);

  // Update productNames and filter orphaned data from MOCK_NOTAS
  const validNotas: Nota[] = [];
  MOCK_NOTAS.forEach(nota => {
    const product = productLookup.get(nota.productId);
    if (product) {
      nota.productName = product.name;
      validNotas.push(nota);
    }
  });
  MOCK_NOTAS.length = 0;
  MOCK_NOTAS.push(...validNotas);

  // --- Recalculate stock based on the now consistent data ---
  const productStockMap = new Map<string, number>();
  MOCK_PRODUCTS.forEach(p => productStockMap.set(p.id, 0));

  // Apply all adjustments from the (now filtered and name-updated) MOCK_STOCK_ADJUSTMENTS array.
  // This array should contain initial stock, manual adjustments, and potentially entries from previous calculations for sales/notas.
  MOCK_STOCK_ADJUSTMENTS.forEach(adj => {
    productStockMap.set(adj.productId, (productStockMap.get(adj.productId) || 0) + adj.quantityChange);
  });

  // Ensure MOCK_STOCK_ADJUSTMENTS contains entries for all MOCK_NOTAS.
  // If an adjustment for a nota isn't found in MOCK_STOCK_ADJUSTMENTS, add it and update the map.
  MOCK_NOTAS.forEach(nota => {
    const product = productLookup.get(nota.productId); // Product is guaranteed to exist due to filtering
    if (product) {
      const hasNotaAdjustment = MOCK_STOCK_ADJUSTMENTS.some(
        sa => sa.productId === nota.productId &&
              sa.reason === "Entrada por Nota" &&
              sa.quantityChange === nota.quantity &&
              new Date(sa.date).toISOString().substring(0,10) === new Date(nota.date).toISOString().substring(0,10) // Compare date part only
      );

      if (!hasNotaAdjustment) {
        const stockAdjustmentFromNota: StockAdjustment = {
            id: generateId(),
            productId: nota.productId,
            productName: product.name,
            quantityChange: nota.quantity,
            reason: "Entrada por Nota",
            date: nota.date,
            createdAt: nota.createdAt,
        };
        MOCK_STOCK_ADJUSTMENTS.push(stockAdjustmentFromNota);
        // Update map as this adjustment wasn't part of the initial MOCK_STOCK_ADJUSTMENTS pass
        productStockMap.set(nota.productId, (productStockMap.get(nota.productId) || 0) + nota.quantity);
      }
    }
  });

  // Ensure MOCK_STOCK_ADJUSTMENTS contains entries for all MOCK_SALES.
  // If an adjustment for a sale isn't found, add it and update the map.
  MOCK_SALES.forEach(sale => {
    const product = productLookup.get(sale.productId); // Product is guaranteed to exist
    if (product) {
      const saleReasonPrefix = `Venda ID: ${sale.id.substring(0,4)}`;
      const hasSaleAdjustment = MOCK_STOCK_ADJUSTMENTS.some(
        sa => sa.productId === sale.productId &&
              sa.reason.startsWith(saleReasonPrefix) &&
              sa.quantityChange === -sale.quantitySold &&
              new Date(sa.date).toISOString().substring(0,10) === new Date(sale.saleDate).toISOString().substring(0,10) // Compare date part only
      );

      if (!hasSaleAdjustment) {
        const saleAdjustment: StockAdjustment = {
          id: generateId(),
          productId: sale.productId,
          productName: product.name,
          quantityChange: -sale.quantitySold,
          reason: saleReasonPrefix,
          date: sale.saleDate,
          createdAt: sale.createdAt,
        };
        MOCK_STOCK_ADJUSTMENTS.push(saleAdjustment);
        // Update map
        productStockMap.set(sale.productId, (productStockMap.get(sale.productId) || 0) - sale.quantitySold);
      }
    }
  });

  // Final pass: Update product.currentStock from the map, which now reflects ALL movements.
  MOCK_PRODUCTS.forEach(p => {
    p.currentStock = productStockMap.get(p.id) || 0;
  });

  // Sort MOCK_STOCK_ADJUSTMENTS by date descending as AppContext expects it sorted for initial load.
  MOCK_STOCK_ADJUSTMENTS.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
})();
