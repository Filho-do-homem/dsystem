"use client";

import * as React from "react";
import { useAppContext } from "@/contexts/AppContext";
import type { Product } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type ColumnDefinition } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StockLevelsPage() {
  const { products } = useAppContext();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("all");

  const productTypes = React.useMemo(() => {
    const types = new Set(products.map(p => p.type));
    return ["all", ...Array.from(types).sort()];
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    return products
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(product => 
        selectedType === "all" || product.type === selectedType
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchTerm, selectedType]);


  const columns: ColumnDefinition<Product>[] = [
    { accessorKey: "name", header: "Product Name", size: 300 },
    { accessorKey: "type", header: "Type", size: 150 },
    { 
      accessorKey: "currentStock", 
      header: "Current Stock", 
      size: 150,
      cell: (row) => (
        <Badge 
          variant={row.currentStock === 0 ? "destructive" : row.currentStock < 10 ? "secondary" : "default"}
          className={row.currentStock < 10 && row.currentStock > 0 ? "bg-yellow-400 text-yellow-900" : ""}
        >
          {row.currentStock}
        </Badge>
      )
    },
    { 
      accessorKey: "costPrice", 
      header: "Cost/Item",
      size: 120,
      cell: (row) => `$${row.costPrice.toFixed(2)}`
    },
    { 
      accessorKey: "sellingPrice", 
      header: "Sell/Item",
      size: 120,
      cell: (row) => `$${row.sellingPrice.toFixed(2)}`
    },
    {
      accessorKey: "totalValue",
      header: "Total Stock Value (Cost)",
      size: 200,
      cell: (row) => `$${(row.currentStock * row.costPrice).toFixed(2)}`
    }
  ];

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Stock Levels" description="View current inventory levels for all products." />

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <Input 
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {productTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type === "all" ? "All Types" : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filteredProducts} caption="Current stock levels." />
    </div>
  );
}
