
"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { DollarSign, Package, ShoppingCart, TrendingUp, ListChecks } from "lucide-react";
import type { SummaryCardData } from "@/types";
import Image from "next/image";

export default function DashboardPage() {
  const { products, sales, stockAdjustments } = useAppContext();

  const totalProducts = products.length;
  const totalStockItems = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalStockValue = products.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);
  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  const summaryCards: SummaryCardData[] = [
    { title: "Total de Produtos", value: totalProducts, icon: Package, description: "Tipos de produtos distintos" },
    { title: "Total de Itens em Estoque", value: totalStockItems, icon: ListChecks, description: "Soma de todos os itens em estoque" },
    { title: "Valor Total do Estoque (Custo)", value: `R$${totalStockValue.toFixed(2)}`, icon: DollarSign, description: "Baseado no preço de custo" },
    { title: "Total de Vendas", value: totalSalesCount, icon: ShoppingCart, description: "Número de transações de venda" },
    { title: "Receita Total", value: `R$${totalRevenue.toFixed(2)}`, icon: TrendingUp, description: "Receita bruta das vendas" },
  ];

  const recentActivityLimit = 5;
  const recentSales = sales.slice(0, recentActivityLimit);
  const recentStockAdjustments = stockAdjustments.slice(0, recentActivityLimit);


  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Painel" description="Visão geral do desempenho e inventário da sua loja." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        {summaryCards.map((card) => (
          <Card key={card.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">{card.value}</div>
              {card.description && <p className="text-xs text-muted-foreground pt-1">{card.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length > 0 ? (
              <ul className="space-y-3">
                {recentSales.map(sale => (
                  <li key={sale.id} className="flex justify-between items-center p-2 bg-secondary/30 rounded-md">
                    <div>
                      <p className="font-semibold">{sale.productName}</p>
                      <p className="text-xs text-muted-foreground">Vendido: {sale.quantitySold} unidades em {new Date(sale.saleDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <p className="text-primary font-semibold">R${sale.totalAmount.toFixed(2)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhuma venda recente.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Ajustes de Estoque Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentStockAdjustments.length > 0 ? (
              <ul className="space-y-3">
                {recentStockAdjustments.map(adj => (
                  <li key={adj.id} className="flex justify-between items-center p-2 bg-secondary/30 rounded-md">
                    <div>
                      <p className="font-semibold">{adj.productName}</p>
                      <p className="text-xs text-muted-foreground">{adj.reason} em {new Date(adj.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <p className={`font-semibold ${adj.quantityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {adj.quantityChange > 0 ? '+' : ''}{adj.quantityChange} unidades
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhum ajuste de estoque recente.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
