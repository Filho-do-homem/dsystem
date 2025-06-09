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
    { title: "Total Products", value: totalProducts, icon: Package, description: "Distinct product types" },
    { title: "Total Stock Items", value: totalStockItems, icon: ListChecks, description: "Sum of all items in stock" },
    { title: "Total Stock Value (Cost)", value: `$${totalStockValue.toFixed(2)}`, icon: DollarSign, description: "Based on cost price" },
    { title: "Total Sales Count", value: totalSalesCount, icon: ShoppingCart, description: "Number of sales transactions" },
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, description: "Gross revenue from sales" },
  ];

  const recentActivityLimit = 5;
  const recentSales = sales.slice(0, recentActivityLimit);
  const recentStockAdjustments = stockAdjustments.slice(0, recentActivityLimit);


  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Dashboard" description="Overview of your store's performance and inventory." />
      
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
            <CardTitle className="font-headline">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length > 0 ? (
              <ul className="space-y-3">
                {recentSales.map(sale => (
                  <li key={sale.id} className="flex justify-between items-center p-2 bg-secondary/30 rounded-md">
                    <div>
                      <p className="font-semibold">{sale.productName}</p>
                      <p className="text-xs text-muted-foreground">Sold: {sale.quantitySold} units on {new Date(sale.saleDate).toLocaleDateString()}</p>
                    </div>
                    <p className="text-primary font-semibold">${sale.totalAmount.toFixed(2)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent sales.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Recent Stock Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentStockAdjustments.length > 0 ? (
              <ul className="space-y-3">
                {recentStockAdjustments.map(adj => (
                  <li key={adj.id} className="flex justify-between items-center p-2 bg-secondary/30 rounded-md">
                    <div>
                      <p className="font-semibold">{adj.productName}</p>
                      <p className="text-xs text-muted-foreground">{adj.reason} on {new Date(adj.date).toLocaleDateString()}</p>
                    </div>
                    <p className={`font-semibold ${adj.quantityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {adj.quantityChange > 0 ? '+' : ''}{adj.quantityChange} units
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent stock adjustments.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12 text-center">
        <Image 
          src="https://placehold.co/600x300.png" 
          alt="Artisanal products display"
          data-ai-hint="artisanal products" 
          width={600} 
          height={300} 
          className="mx-auto rounded-lg shadow-md"
        />
        <p className="mt-4 text-muted-foreground font-headline">CraftFlow helps you manage your artisanal creations with ease.</p>
      </div>
    </div>
  );
}
