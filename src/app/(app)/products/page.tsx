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
import { Label } from "@/components/ui/label";
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
import { PlusCircle, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  type: z.string().min(1, "Type is required").max(50, "Type is too long"),
  costPrice: z.coerce.number().min(0, "Cost price must be non-negative"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be non-negative"),
  initialStock: z.coerce.number().int().min(0, "Initial stock must be a non-negative integer"),
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
        costPrice: editingProduct.costPrice,
        sellingPrice: editingProduct.sellingPrice,
        initialStock: editingProduct.currentStock, // For editing, 'initialStock' field represents current stock to be set.
      });
    } else {
      form.reset();
    }
  }, [editingProduct, form, isModalOpen]);


  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    try {
      if (editingProduct) {
        const updated: Product = {
          ...editingProduct,
          ...data,
          // For an edit, currentStock might need more complex logic or a separate flow.
          // Here, we assume an edit might reset stock if 'initialStock' field is used that way.
          // A better approach for stock updates is through Stock Adjustments.
          // This simplistic update is for product details mainly.
          // Let's assume initialStock field in edit mode is actually to set currentStock directly for simplicity here.
          currentStock: data.initialStock 
        };
        updateProduct(updated);
        toast({ title: "Success", description: "Product updated successfully." });
      } else {
        addProduct({
          name: data.name,
          type: data.type,
          costPrice: data.costPrice,
          sellingPrice: data.sellingPrice,
          initialStock: data.initialStock,
        });
        toast({ title: "Success", description: "Product added successfully." });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      form.reset();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save product." });
      console.error(error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  
  // handleDelete would require more state logic or backend. Placeholder.
  // const handleDelete = (productId: string) => { 
  //   toast({ title: "Info", description: "Delete functionality not implemented in this demo." });
  // };

  const columns: ColumnDefinition<Product>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type" },
    { 
      accessorKey: "costPrice", 
      header: "Cost Price",
      cell: (row) => `$${row.costPrice.toFixed(2)}`
    },
    { 
      accessorKey: "sellingPrice", 
      header: "Selling Price",
      cell: (row) => `$${row.sellingPrice.toFixed(2)}`
    },
    { accessorKey: "currentStock", header: "Current Stock" },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => handleEdit(row)} className="hover:text-primary">
            <Edit2 className="h-4 w-4" />
          </Button>
          {/* <Button variant="outline" size="icon" onClick={() => handleDelete(row.id)} className="hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button> */}
        </div>
      ),
    },
  ];
  
  // Sort products by name for consistent display
  const sortedProducts = React.useMemo(() => 
    [...products].sort((a, b) => a.name.localeCompare(b.name)), 
    [products]
  );


  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Products" description="Manage your artisanal products.">
        <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={sortedProducts} caption="List of all products." />

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) {
          setEditingProduct(null);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update the details of your product." : "Enter the details of your new product."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lavender Dream Candle" {...field} />
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
                    <FormLabel>Product Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Candle, Cream, Perfume" {...field} />
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
                      <FormLabel>Cost Price ($)</FormLabel>
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
                      <FormLabel>Selling Price ($)</FormLabel>
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
                    <FormLabel>{editingProduct ? "Set Current Stock" : "Initial Stock Quantity"}</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {editingProduct ? "Save Changes" : "Add Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
