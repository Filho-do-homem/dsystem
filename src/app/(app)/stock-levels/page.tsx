
"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from "@/contexts/AppContext";
import type { Product } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type ColumnDefinition } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Edit2, ScanBarcode } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  type: z.string().min(1, "Tipo é obrigatório").max(50, "Tipo muito longo"),
  barcode: z.string().max(50, "Código de barras muito longo").optional().or(z.literal('')),
  costPrice: z.coerce.number().min(0, "Preço de custo deve ser não-negativo"),
  sellingPrice: z.coerce.number().min(0, "Preço de venda deve ser não-negativo"),
  initialStock: z.coerce.number().int().min(0, "Estoque deve ser um inteiro não-negativo"), // Used for current stock when editing
});

type ProductFormData = z.infer<typeof productSchema>;

export default function StockLevelsPage() {
  const { products, deleteProduct, updateProduct } = useAppContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("all");
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      type: "",
      barcode: "",
      costPrice: 0,
      sellingPrice: 0,
      initialStock: 0,
    },
  });

  React.useEffect(() => {
    if (editingProduct && isEditModalOpen) {
      form.reset({
        name: editingProduct.name,
        type: editingProduct.type,
        barcode: editingProduct.barcode || "",
        costPrice: editingProduct.costPrice,
        sellingPrice: editingProduct.sellingPrice,
        initialStock: editingProduct.currentStock, 
      });
    } else {
      form.reset({ name: "", type: "", barcode: "", costPrice: 0, sellingPrice: 0, initialStock: 0 });
    }
  }, [editingProduct, form, isEditModalOpen]);

  const productTypes = React.useMemo(() => {
    const types = new Set(products.map(p => p.type));
    return ["all", ...Array.from(types).sort()];
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    return products
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
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

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const onEditSubmit: SubmitHandler<ProductFormData> = (data) => {
    if (!editingProduct) return;
    try {
      const updated: Product = {
        ...editingProduct,
        ...data,
        barcode: data.barcode || undefined,
        currentStock: data.initialStock 
      };
      updateProduct(updated);
      toast({ title: "Sucesso", description: "Produto atualizado com sucesso." });
      setIsEditModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao atualizar produto." });
      console.error(error);
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
          className={cn(
            row.currentStock < 10 && row.currentStock > 0 
              ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80" 
              : "",
            row.currentStock === 0 ? "bg-destructive text-destructive-foreground hover:bg-destructive/80" : ""
          )}
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
      size: 100,
      cell: (row) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleEditClick(row)}
            className="hover:text-primary hover:border-primary"
          >
            <Edit2 className="h-4 w-4" />
             <span className="sr-only">Editar produto</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleDeleteClick(row)}
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Excluir produto</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Níveis de Estoque" description="Veja os níveis de estoque atuais para todos os produtos." />

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <Input 
          placeholder="Buscar produtos por nome, tipo ou cód. barras..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
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

      {/* Delete Product Dialog */}
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

      {/* Edit Product Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
        setIsEditModalOpen(isOpen);
        if (!isOpen) {
          setEditingProduct(null); // Clear editing product when closing
        }
      }}>
        <DialogContent className="sm:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="font-headline">Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize os detalhes do seu produto.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="ex.: Vela Sonho de Lavanda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="ex.: Vela, Creme, Perfume" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Barras (Opcional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <ScanBarcode className="h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Digite ou escaneie o código" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Custo (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Venda (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="initialStock" // This field is used to set currentStock when editing
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Definir Estoque Atual</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    