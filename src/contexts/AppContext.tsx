"use client";

import type React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Product, StockAdjustment, Sale } from '@/types';
import { generateId } from '@/lib/utils';
import { MOCK_PRODUCTS, MOCK_STOCK_ADJUSTMENTS, MOCK_SALES } from '@/lib/mockData';


interface AppContextType {
  products: Product[];
  stockAdjustments: StockAdjustment[];
  sales: Sale[];
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'currentStock'> & { initialStock: number }) => Product;
  addStockAdjustment: (adjustmentData: Omit<StockAdjustment, 'id' | 'createdAt' | 'productName'>) => StockAdjustment;
  addSale: (saleData: Omit<Sale, 'id' | 'createdAt' | 'totalAmount' | 'productName'>) => Sale | null;
  getProductById: (productId: string) => Product | undefined;
  updateProduct: (updatedProduct: Product) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setProducts(MOCK_PRODUCTS);
    setStockAdjustments(MOCK_STOCK_ADJUSTMENTS.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setSales(MOCK_SALES.sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()));
    setIsInitialized(true);
  }, []);
  
  const getProductById = useCallback((productId: string) => {
    return products.find(p => p.id === productId);
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
      currentStock: productData.initialStock,
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);

    if (productData.initialStock > 0) {
      const initialAdjustment: StockAdjustment = {
        id: generateId(),
        productId: newProduct.id,
        productName: newProduct.name,
        quantityChange: productData.initialStock,
        reason: "Estoque Inicial", // Translated
        date: newProduct.createdAt,
        createdAt: newProduct.createdAt,
      };
      setStockAdjustments(prev => [...prev, initialAdjustment].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    return newProduct;
  }, []);

  const addStockAdjustment = useCallback((adjustmentData: Omit<StockAdjustment, 'id' | 'createdAt' | 'productName'>) => {
    const product = getProductById(adjustmentData.productId);
    if (!product) {
      console.error("Produto não encontrado para ajuste de estoque");
      throw new Error("Produto não encontrado");
    }

    const newAdjustment: StockAdjustment = {
      ...adjustmentData,
      id: generateId(),
      productName: product.name,
      createdAt: new Date().toISOString(),
    };
    setStockAdjustments(prev => [...prev, newAdjustment].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    const updatedProduct = { ...product, currentStock: product.currentStock + adjustmentData.quantityChange };
    updateProduct(updatedProduct);
    return newAdjustment;
  }, [getProductById, updateProduct]);

  const addSale = useCallback((saleData: Omit<Sale, 'id' | 'createdAt' | 'totalAmount' | 'productName'>) => {
    const product = getProductById(saleData.productId);
    if (!product) {
      console.error("Produto não encontrado para venda");
      return null;
    }
    if (product.currentStock < saleData.quantitySold) {
      console.error("Estoque insuficiente para venda");
      return null; 
    }

    const newSale: Sale = {
      ...saleData,
      id: generateId(),
      productName: product.name,
      totalAmount: saleData.quantitySold * saleData.pricePerItem,
      createdAt: new Date().toISOString(),
    };
    setSales(prev => [...prev, newSale].sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()));

    const updatedProduct = { ...product, currentStock: product.currentStock - saleData.quantitySold };
    updateProduct(updatedProduct);
    return newSale;
  }, [getProductById, updateProduct]);


  if (!isInitialized) {
    return null; 
  }

  return (
    <AppContext.Provider value={{ products, stockAdjustments, sales, addProduct, addStockAdjustment, addSale, getProductById, updateProduct }}>
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
