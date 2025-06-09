
"use client";

import type React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Product, StockAdjustment, Sale, Nota } from '@/types';
import { generateId } from '@/lib/utils';
import { MOCK_PRODUCTS, MOCK_STOCK_ADJUSTMENTS, MOCK_SALES, MOCK_NOTAS } from '@/lib/mockData';


interface AppContextType {
  products: Product[];
  stockAdjustments: StockAdjustment[];
  sales: Sale[];
  notas: Nota[];
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'currentStock'> & { initialStock: number }) => Product;
  addStockAdjustment: (adjustmentData: Omit<StockAdjustment, 'id' | 'createdAt' | 'productName'>) => StockAdjustment;
  addSale: (saleData: Omit<Sale, 'id' | 'createdAt' | 'totalAmount' | 'productName'>) => Sale | null;
  addNota: (notaData: Omit<Nota, 'id' | 'createdAt' | 'productName'>) => Nota;
  getProductById: (productId: string) => Product | undefined;
  getProductByBarcode: (barcode: string) => Product | undefined;
  updateProduct: (updatedProduct: Product) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setProducts(MOCK_PRODUCTS);
    setStockAdjustments(MOCK_STOCK_ADJUSTMENTS.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setSales(MOCK_SALES.sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()));
    setNotas(MOCK_NOTAS.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsInitialized(true);
  }, []);
  
  const getProductById = useCallback((productId: string) => {
    return products.find(p => p.id === productId);
  }, [products]);

  const getProductByBarcode = useCallback((barcode: string) => {
    return products.find(p => p.barcode === barcode);
  }, [products]);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  }, []);

  const addProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt' | 'currentStock'> & { initialStock: number }) => {
    const newProduct: Product = {
      ...productData,
      id: generateId(),
      barcode: productData.barcode || undefined,
      currentStock: 0, 
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);

    if (productData.initialStock !== 0) { 
        const initialAdjustment: Omit<StockAdjustment, 'id' | 'createdAt' | 'productName'> = {
            productId: newProduct.id,
            quantityChange: productData.initialStock,
            reason: "Estoque Inicial",
            date: newProduct.createdAt,
        };
        const productForAdjustment = newProduct;
        const fullInitialAdjustment: StockAdjustment = {
            ...initialAdjustment,
            id: generateId(),
            productName: productForAdjustment.name,
            createdAt: newProduct.createdAt,
        };
        setStockAdjustments(prev => [...prev, fullInitialAdjustment].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        updateProduct({ ...productForAdjustment, currentStock: productData.initialStock });
    }
    return newProduct;
  }, [updateProduct]);


  const addStockAdjustment = useCallback((adjustmentData: Omit<StockAdjustment, 'id' | 'createdAt' | 'productName'>) => {
    const product = getProductById(adjustmentData.productId);
    if (!product) {
      console.error("Produto não encontrado para ajuste de estoque:", adjustmentData.productId);
      throw new Error("Produto não encontrado para registrar o ajuste de estoque.");
    }

    const newAdjustment: StockAdjustment = {
      ...adjustmentData,
      id: generateId(),
      productName: product.name,
      createdAt: new Date().toISOString(),
    };
    setStockAdjustments(prev => [...prev, newAdjustment].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    const updatedStock = product.currentStock + adjustmentData.quantityChange;
    if (updatedStock < 0) {
        // Prevent stock from going negative beyond what a sale might cause
        // This specific error might be better handled by the calling function (e.g. addSale)
        // For direct adjustments, we might allow it, but sales should check first.
        console.warn(`Ajuste resultaria em estoque negativo para ${product.name}. Estoque atual: ${product.currentStock}, Mudança: ${adjustmentData.quantityChange}`);
    }
    const updatedProduct = { ...product, currentStock: updatedStock };
    updateProduct(updatedProduct);
    return newAdjustment;
  }, [getProductById, updateProduct]);

  const addNota = useCallback((notaData: Omit<Nota, 'id' | 'createdAt' | 'productName'>) => {
    const product = getProductById(notaData.productId);
    if (!product) {
      console.error("Produto não encontrado para nota de entrada:", notaData.productId);
      throw new Error("Produto não encontrado para registrar a nota.");
    }

    const newNota: Nota = {
      ...notaData,
      id: generateId(),
      productName: product.name,
      createdAt: new Date().toISOString(),
    };
    setNotas(prev => [...prev, newNota].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    addStockAdjustment({
      productId: notaData.productId,
      quantityChange: notaData.quantity, 
      reason: "Entrada por Nota",
      date: notaData.date, 
    });
    
    return newNota;
  }, [getProductById, addStockAdjustment]);


  const addSale = useCallback((saleData: Omit<Sale, 'id' | 'createdAt' | 'totalAmount' | 'productName'>) => {
    const product = getProductById(saleData.productId);
    if (!product) {
      console.error("Produto não encontrado para venda");
      throw new Error("Produto não encontrado para registrar a venda.");
    }
    if (product.currentStock < saleData.quantitySold) {
      console.error("Estoque insuficiente para venda");
      throw new Error(`Estoque insuficiente para ${product.name}. Disponível: ${product.currentStock}`);
    }

    const newSale: Sale = {
      ...saleData,
      id: generateId(),
      productName: product.name,
      totalAmount: saleData.quantitySold * saleData.pricePerItem,
      createdAt: new Date().toISOString(),
    };
    setSales(prev => [...prev, newSale].sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()));

    addStockAdjustment({
        productId: saleData.productId,
        quantityChange: -saleData.quantitySold, 
        reason: `Venda ID: ${newSale.id.substring(0,4)}`,
        date: saleData.saleDate,
    });
    return newSale;
  }, [getProductById, addStockAdjustment]);


  if (!isInitialized) {
    return null; 
  }

  return (
    <AppContext.Provider value={{ 
        products, 
        stockAdjustments, 
        sales, 
        notas, 
        addProduct, 
        addStockAdjustment, 
        addSale, 
        addNota, 
        getProductById, 
        getProductByBarcode,
        updateProduct 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppContextProvider');
  }
  return context;
};
