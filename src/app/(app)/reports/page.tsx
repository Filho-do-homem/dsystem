
"use client";

import * as React from "react";
import { useAppContext } from "@/contexts/AppContext";
import type { Product, Sale } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Package, DollarSign, AlertCircle } from "lucide-react";

interface ProductSaleData {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface ProductMarginData {
  name: string;
  margin: number;
}

export default function ReportsPage() {
  const { products, sales } = useAppContext();

  const salesReport = React.useMemo(() => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalSalesCount = sales.length;
    const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
    
    const salesByProduct = sales.reduce((acc, sale) => {
      if (!acc[sale.productId]) {
        acc[sale.productId] = { productId: sale.productId, name: sale.productName || 'Produto Desconhecido', quantity: 0, revenue: 0 };
      }
      acc[sale.productId].quantity += sale.quantitySold;
      acc[sale.productId].revenue += sale.totalAmount;
      return acc;
    }, {} as Record<string, ProductSaleData>);

    const productSalesArray = Object.values(salesByProduct);
    const bestSellingByQuantity = [...productSalesArray].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const bestSellingByRevenue = [...productSalesArray].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    
    return { totalRevenue, totalSalesCount, totalItemsSold, bestSellingByQuantity, bestSellingByRevenue };
  }, [sales]);

  const stockReport = React.useMemo(() => {
    const totalStockValue = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);
    const totalStockItems = products.reduce((sum, p) => sum + p.currentStock, 0);
    const lowStockProducts = products.filter(p => p.currentStock > 0 && p.currentStock < 10).sort((a,b) => a.currentStock - b.currentStock);
    const outOfStockProducts = products.filter(p => p.currentStock === 0);

    return { totalStockValue, totalStockItems, lowStockProducts, outOfStockProducts };
  }, [products]);

  const productPerformanceReport = React.useMemo(() => {
    const productsWithMargin = products
      .map(p => ({
        name: p.name,
        margin: p.sellingPrice - p.costPrice
      }))
      .filter(p => p.margin > 0);
    
    const highestMarginProducts = [...productsWithMargin].sort((a, b) => b.margin - a.margin).slice(0, 5);
    
    return { highestMarginProducts };
  }, [products]);

  const renderProductList = (list: {name: string, quantity?: number, revenue?: number, margin?: number, stock?: number}[], valueLabel: string, valueField: 'quantity' | 'revenue' | 'margin' | 'stock', isCurrency = false) => {
    if (list.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado para exibir.</p>;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead className="text-right">{valueLabel}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right">
                {isCurrency ? `R$${(item[valueField] as number)?.toFixed(2)}` : item[valueField]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Relatórios" description="Análise de desempenho de vendas, estoque e produtos." />

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {/* Sales Report Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><TrendingUp className="mr-2 h-6 w-6 text-primary"/> Relatório de Vendas</CardTitle>
            <CardDescription>Performance geral das vendas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">R${salesReport.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Total de Vendas</p>
                <p className="text-2xl font-bold">{salesReport.totalSalesCount}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Mais Vendidos (por Quantidade)</h4>
              {renderProductList(salesReport.bestSellingByQuantity, "Unidades", "quantity")}
            </div>
            <div>
              <h4 className="font-semibold mb-2">Mais Vendidos (por Receita)</h4>
              {renderProductList(salesReport.bestSellingByRevenue, "Receita", "revenue", true)}
            </div>
          </CardContent>
        </Card>

        {/* Stock Report Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Package className="mr-2 h-6 w-6 text-primary"/> Relatório de Estoque</CardTitle>
            <CardDescription>Visão geral do inventário.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Valor do Estoque (Custo)</p>
                <p className="text-2xl font-bold">R${stockReport.totalStockValue.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Itens em Estoque</p>
                <p className="text-2xl font-bold">{stockReport.totalStockItems}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center text-yellow-600">
                <AlertCircle className="mr-2 h-5 w-5" /> Produtos com Estoque Baixo (&lt; 10 unidades)
              </h4>
              {renderProductList(stockReport.lowStockProducts.map(p => ({ name: p.name, stock: p.currentStock })), "Estoque", "stock")}
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" /> Produtos Esgotados
              </h4>
               {renderProductList(stockReport.outOfStockProducts.map(p => ({ name: p.name, stock: p.currentStock })), "Estoque", "stock")}
            </div>
          </CardContent>
        </Card>

        {/* Product Performance Card */}
        <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><DollarSign className="mr-2 h-6 w-6 text-primary"/> Desempenho de Produtos</CardTitle>
                <CardDescription>Análise de lucratividade dos produtos.</CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    <h4 className="font-semibold mb-2">Produtos com Maior Margem de Lucro</h4>
                    {renderProductList(productPerformanceReport.highestMarginProducts, "Margem (R$)", "margin", true)}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
