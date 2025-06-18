
"use client";

import type React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Product, StockAdjustment, Sale, Nota } from '@/types';
import { generateId } from '@/lib/utils';
// MOCK_DATA will now be initialized as empty arrays by default.
import { MOCK_PRODUCTS, MOCK_STOCK_ADJUSTMENTS, MOCK_SALES, MOCK_NOTAS } from '@/lib/mockData';

const PRODUCTS_STORAGE_KEY = 'dsystem_products';
const STOCK_ADJUSTMENTS_STORAGE_KEY = 'dsystem_stock_adjustments';
const SALES_STORAGE_KEY = 'dsystem_sales';
const NOTAS_STORAGE_KEY = 'dsystem_notas';

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
  deleteProduct: (productId: string) => void;
  clearSales: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on initial mount
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      setProducts(storedProducts ? JSON.parse(storedProducts) : MOCK_PRODUCTS);

      const storedStockAdjustments = localStorage.getItem(STOCK_ADJUSTMENTS_STORAGE_KEY);
      setStockAdjustments(storedStockAdjustments ? JSON.parse(storedStockAdjustments) : MOCK_STOCK_ADJUSTMENTS);
      
      const storedSales = localStorage.getItem(SALES_STORAGE_KEY);
      setSales(storedSales ? JSON.parse(storedSales) : MOCK_SALES);

      const storedNotas = localStorage.getItem(NOTAS_STORAGE_KEY);
      setNotas(storedNotas ? JSON.parse(storedNotas) : MOCK_NOTAS);

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Fallback to empty mock data if parsing fails
      setProducts(MOCK_PRODUCTS);
      setStockAdjustments(MOCK_STOCK_ADJUSTMENTS);
      setSales(MOCK_SALES);
      setNotas(MOCK_NOTAS);
    }
    setIsInitialized(true);
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, isInitialized]);

  // Save stockAdjustments to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STOCK_ADJUSTMENTS_STORAGE_KEY, JSON.stringify(stockAdjustments));
    }
  }, [stockAdjustments, isInitialized]);

  // Save sales to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
    }
  }, [sales, isInitialized]);

  // Save notas to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(NOTAS_STORAGE_KEY, JSON.stringify(notas));
    }
  }, [notas, isInitialized]);
  
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
        // Need to update the product's stock immediately for the adjustment logic
        const productForAdjustment = { ...newProduct, currentStock: productData.initialStock };
        
        setStockAdjustments(prev => {
            const fullInitialAdjustment: StockAdjustment = {
                ...initialAdjustment,
                id: generateId(),
                productName: productForAdjustment.name, // Use name from newly created product
                createdAt: newProduct.createdAt,
            };
            return [...prev, fullInitialAdjustment].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        // Update the product in the main products list
        setProducts(prev => prev.map(p => p.id === productForAdjustment.id ? productForAdjustment : p));
    }
    return newProduct;
  }, []);


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
    
    const updatedProduct = { ...product, currentStock: updatedStock };
    updateProduct(updatedProduct); // This will trigger the useEffect to save products
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
    
    // This will call addStockAdjustment, which updates product stock and saves both adjustments and products
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
    setSales(prev => [...prev, newSale].sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.date).getTime()));

    // This will call addStockAdjustment, which updates product stock and saves both adjustments and products
    addStockAdjustment({
        productId: saleData.productId,
        quantityChange: -saleData.quantitySold, 
        reason: `Venda ID: ${newSale.id.substring(0,4)}`,
        date: saleData.saleDate,
    });
    return newSale;
  }, [getProductById, addStockAdjustment]);

  const clearSales = useCallback(() => {
    setSales([]); // This will trigger the useEffect to save the empty sales array
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    // Order matters here to ensure productName is available if needed for other logs/cleanup before removal
    setProducts(prev => prev.filter(p => p.id !== productId));
    setStockAdjustments(prev => prev.filter(sa => sa.productId !== productId));
    setSales(prev => prev.filter(s => s.productId !== productId));
    setNotas(prev => prev.filter(n => n.productId !== productId));
  }, []);


  if (!isInitialized) {
    // Render nothing or a loading indicator until data is loaded from localStorage
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
        updateProduct,
        deleteProduct,
        clearSales
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
