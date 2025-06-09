"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from "@/contexts/AppContext";
import type { Sale } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type ColumnDefinition } from "@/components/common/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PlusCircle, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const saleSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantitySold: z.coerce.number().int().min(1, "Quantidade deve ser no mínimo 1"),
  pricePerItem: z.coerce.number().min(0, "Preço deve ser não-negativo"),
  saleDate: z.date({ required_error: "Data da venda é obrigatória." }),
});

type SaleFormData = z.infer<typeof saleSchema>;

export default function SalesPage() {
  const { products, sales, addSale, getProductById } = useAppContext();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      productId: "",
      quantitySold: 1,
      pricePerItem: 0,
      saleDate: new Date(),
    },
  });

  const selectedProductId = form.watch("productId");

  React.useEffect(() => {
    if (selectedProductId) {
      const product = getProductById(selectedProductId);
      if (product) {
        form.setValue("pricePerItem", product.sellingPrice);
      }
    } else {
      form.setValue("pricePerItem", 0);
    }
  }, [selectedProductId, getProductById, form]);

  const onSubmit: SubmitHandler<SaleFormData> = (data) => {
    const product = getProductById(data.productId);
    if (!product) {
      toast({ variant: "destructive", title: "Erro", description: "Produto selecionado não encontrado." });
      return;
    }
    if (product.currentStock < data.quantitySold) {
       toast({ variant: "destructive", title: "Erro", description: `Estoque insuficiente para ${product.name}. Disponível: ${product.currentStock}` });
       return;
    }

    const saleRecorded = addSale({
      productId: data.productId,
      quantitySold: data.quantitySold,
      pricePerItem: data.pricePerItem,
      saleDate: data.saleDate.toISOString(),
    });

    if (saleRecorded) {
      toast({ title: "Sucesso", description: "Venda registrada com sucesso." });
      setIsModalOpen(false);
      form.reset({ saleDate: new Date(), quantitySold: 1, pricePerItem: 0, productId: "" });
    }
  };

  const columns: ColumnDefinition<Sale>[] = [
    { 
      accessorKey: "saleDate", 
      header: "Data",
      cell: (row) => new Date(row.saleDate).toLocaleDateString('pt-BR'),
    },
    { accessorKey: "productName", header: "Produto" },
    { accessorKey: "quantitySold", header: "Quantidade" },
    { 
      accessorKey: "pricePerItem", 
      header: "Preço/Item",
      cell: (row) => `R$${row.pricePerItem.toFixed(2)}` 
    },
    { 
      accessorKey: "totalAmount", 
      header: "Valor Total",
      cell: (row) => `R$${row.totalAmount.toFixed(2)}`
    },
  ];

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Vendas" description="Registre novas vendas e veja o histórico de transações.">
        <Button onClick={() => setIsModalOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Registrar Venda
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={sales} caption="Histórico de transações de venda." />

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) form.reset({ saleDate: new Date(), quantitySold: 1, pricePerItem: 0, productId: "" });
      }}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="font-headline">Registrar Nova Venda</DialogTitle>
            <DialogDescription>
              Insira os detalhes da transação de venda.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products
                          .filter(p => p.currentStock > 0)
                          .map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (Estoque: {product.currentStock})
                          </SelectItem>
                        ))}
                         {products.filter(p => p.currentStock <= 0).length > 0 && (
                            <optgroup label="Fora de Estoque">
                                {products.filter(p => p.currentStock <= 0).map(product => (
                                     <SelectItem key={product.id} value={product.id} disabled>
                                        {product.name} (Estoque: {product.currentStock})
                                    </SelectItem>
                                ))}
                            </optgroup>
                         )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quantitySold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Vendida</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerItem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Por Item (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="saleDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Venda</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Registrar Venda</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
