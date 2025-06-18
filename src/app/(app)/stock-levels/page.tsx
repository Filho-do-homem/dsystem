
"use client";

import * as React from "react";
import { useAppContext } from "@/contexts/AppContext";
import type { Product } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type ColumnDefinition } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StockLevelsPage() {
  const { products, deleteProduct } = useAppContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);

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

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      toast({
        title: "Produto Excluído",
        description: `O produto "${productToDelete.name}" e todos os seus dados associados foram excluídos.`,
      });
      setProductToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const columns: ColumnDefinition<Product>[] = [
    { accessorKey: "name", header: "Nome do Produto", size: 300 },
    { accessorKey: "type", header: "Tipo", size: 150 },
    { 
      accessorKey: "currentStock", 
      header: "Estoque Atual", 
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
      header: "Custo/Item",
      size: 120,
      cell: (row) => `R$${row.costPrice.toFixed(2)}`
    },
    { 
      accessorKey: "sellingPrice", 
      header: "Venda/Item",
      size: 120,
      cell: (row) => `R$${row.sellingPrice.toFixed(2)}`
    },
    {
      accessorKey: "totalValue",
      header: "Valor Total Estoque (Custo)",
      size: 200,
      cell: (row) => `R$${(row.currentStock * row.costPrice).toFixed(2)}`
    },
    {
      accessorKey: "actions",
      header: "Ações",
      size: 80,
      cell: (row) => (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleDeleteClick(row)}
          className="text-destructive hover:text-destructive/80"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Níveis de Estoque" description="Veja os níveis de estoque atuais para todos os produtos." />

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <Input 
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            {productTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type === "all" ? "Todos os Tipos" : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filteredProducts} caption="Níveis de estoque atuais." />

      {productToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza de que deseja excluir o produto "{productToDelete.name}"? 
                Esta ação é irreversível e removerá permanentemente o produto e todos os seus dados associados 
                (histórico de estoque, vendas, notas de entrada).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Confirmar Exclusão
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

