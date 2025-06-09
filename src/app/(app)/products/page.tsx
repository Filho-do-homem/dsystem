
"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from "@/contexts/AppContext";
import type { Product } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type ColumnDefinition } from "@/components/common/DataTable";
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
import { PlusCircle, Edit2, ScanBarcode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  type: z.string().min(1, "Tipo é obrigatório").max(50, "Tipo muito longo"),
  barcode: z.string().max(50, "Código de barras muito longo").optional().or(z.literal('')),
  costPrice: z.coerce.number().min(0, "Preço de custo deve ser não-negativo"),
  sellingPrice: z.coerce.number().min(0, "Preço de venda deve ser não-negativo"),
  initialStock: z.coerce.number().int().min(0, "Estoque inicial deve ser um inteiro não-negativo"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const { products, addProduct, updateProduct } = useAppContext();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const { toast } = useToast();

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
    if (editingProduct) {
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
  }, [editingProduct, form, isModalOpen]);


  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    try {
      if (editingProduct) {
        const updated: Product = {
          ...editingProduct,
          ...data,
          barcode: data.barcode || undefined, // Store as undefined if empty
          currentStock: data.initialStock 
        };
        updateProduct(updated);
        toast({ title: "Sucesso", description: "Produto atualizado com sucesso." });
      } else {
        addProduct({
          name: data.name,
          type: data.type,
          barcode: data.barcode || undefined,
          costPrice: data.costPrice,
          sellingPrice: data.sellingPrice,
          initialStock: data.initialStock,
        });
        toast({ title: "Sucesso", description: "Produto adicionado com sucesso." });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      form.reset({ name: "", type: "", barcode: "", costPrice: 0, sellingPrice: 0, initialStock: 0 });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar produto." });
      console.error(error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  
  const columns: ColumnDefinition<Product>[] = [
    { accessorKey: "name", header: "Nome" },
    { accessorKey: "type", header: "Tipo" },
    { 
      accessorKey: "barcode", 
      header: "Cód. Barras",
      cell: (row) => row.barcode || "N/A"
    },
    { 
      accessorKey: "costPrice", 
      header: "Preço de Custo",
      cell: (row) => `R$${row.costPrice.toFixed(2)}`
    },
    { 
      accessorKey: "sellingPrice", 
      header: "Preço de Venda",
      cell: (row) => `R$${row.sellingPrice.toFixed(2)}`
    },
    { accessorKey: "currentStock", header: "Estoque Atual" },
    {
      accessorKey: "actions",
      header: "Ações",
      cell: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => handleEdit(row)} className="hover:text-primary">
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  const sortedProducts = React.useMemo(() => 
    [...products].sort((a, b) => a.name.localeCompare(b.name)), 
    [products]
  );


  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Produtos" description="Gerencie seus produtos artesanais.">
        <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={sortedProducts} caption="Lista de todos os produtos." />

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) {
          setEditingProduct(null);
          form.reset({ name: "", type: "", barcode: "", costPrice: 0, sellingPrice: 0, initialStock: 0 });
        }
      }}>
        <DialogContent className="sm:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Atualize os detalhes do seu produto." : "Insira os detalhes do seu novo produto."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                name="initialStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{editingProduct ? "Definir Estoque Atual" : "Quantidade Inicial em Estoque"}</FormLabel>
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
                  {editingProduct ? "Salvar Alterações" : "Adicionar Produto"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
