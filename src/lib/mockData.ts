
import type { Product, StockAdjustment, Sale, Nota } from '@/types';
import { generateId } from './utils';

// const today = new Date().toISOString();
// const yesterday = new Date(Date.now() - 86400000).toISOString();
// const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
// const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();

export const MOCK_PRODUCTS: Product[] = [];
export let MOCK_STOCK_ADJUSTMENTS: StockAdjustment[] = [];
export let MOCK_SALES: Sale[] = [];
export let MOCK_NOTAS: Nota[] = [];


// IIFE to initialize/synchronize MOCK_PRODUCTS currentStock and related data
// This will now primarily run on empty arrays unless localStorage populates them beforehand,
// or could be used if we ever re-introduce mock data for specific scenarios.
(() => {
  const productLookup = new Map<string, { name: string }>();
  MOCK_PRODUCTS.forEach(p => productLookup.set(p.id, { name: p.name }));

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

  const productStockMap = new Map<string, number>();
  MOCK_PRODUCTS.forEach(p => productStockMap.set(p.id, 0));

  MOCK_STOCK_ADJUSTMENTS.forEach(adj => {
    productStockMap.set(adj.productId, (productStockMap.get(adj.productId) || 0) + adj.quantityChange);
  });

  MOCK_NOTAS.forEach(nota => {
    const product = productLookup.get(nota.productId); 
    if (product) {
      const hasNotaAdjustment = MOCK_STOCK_ADJUSTMENTS.some(
        sa => sa.productId === nota.productId &&
              sa.reason === "Entrada por Nota" &&
              sa.quantityChange === nota.quantity &&
              new Date(sa.date).toISOString().substring(0,10) === new Date(nota.date).toISOString().substring(0,10) 
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
        productStockMap.set(nota.productId, (productStockMap.get(nota.productId) || 0) + nota.quantity);
      }
    }
  });

  MOCK_SALES.forEach(sale => {
    const product = productLookup.get(sale.productId); 
    if (product) {
      const saleReasonPrefix = `Venda ID: ${sale.id.substring(0,4)}`;
      const hasSaleAdjustment = MOCK_STOCK_ADJUSTMENTS.some(
        sa => sa.productId === sale.productId &&
              sa.reason.startsWith(saleReasonPrefix) &&
              sa.quantityChange === -sale.quantitySold &&
              new Date(sa.date).toISOString().substring(0,10) === new Date(sale.saleDate).toISOString().substring(0,10) 
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
        productStockMap.set(sale.productId, (productStockMap.get(sale.productId) || 0) - sale.quantitySold);
      }
    }
  });

  MOCK_PRODUCTS.forEach(p => {
    p.currentStock = productStockMap.get(p.id) || 0;
  });

  MOCK_STOCK_ADJUSTMENTS.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
})();
