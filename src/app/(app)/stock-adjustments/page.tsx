"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from "@/contexts/AppContext";
import type { StockAdjustment } from "@/types";
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


const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantityChange: z.coerce.number().int().refine(val => val !== 0, "Alteração de quantidade não pode ser zero"),
  reason: z.string().min(1, "Motivo é obrigatório").max(100, "Motivo muito longo"),
  date: z.date({ required_error: "Data é obrigatória." }),
});

type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

const adjustmentReasonsPt = {
  "New Batch": "Novo Lote",
  "Stock Count Correction": "Correção de Contagem",
  "Damaged Goods": "Mercadoria Danificada",
  "Returned Item": "Item Devolvido",
  "Promotion/Gift": "Promoção/Brinde",
  "Other": "Outro",
  "Initial Stock": "Estoque Inicial" // Used internally
};
const displayAdjustmentReasons = Object.values(adjustmentReasonsPt).filter(r => r !== "Estoque Inicial");


export default function StockAdjustmentsPage() {
  const { products, stockAdjustments, addStockAdjustment } = useAppContext();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      productId: "",
      quantityChange: 0,
      reason: "",
      date: new Date(),
    },
  });

  const onSubmit: SubmitHandler<StockAdjustmentFormData> = (data) => {
    try {
      addStockAdjustment({
        productId: data.productId,
        quantityChange: data.quantityChange,
        reason: data.reason, // This will be one of the pt-BR reasons or custom
        date: data.date.toISOString(),
      });
      toast({ title: "Sucesso", description: "Ajuste de estoque registrado com sucesso." });
      setIsModalOpen(false);
      form.reset({ date: new Date(), quantityChange: 0, reason: "", productId: "" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: String(error) || "Falha ao registrar ajuste de estoque." });
      console.error(error);
    }
  };

  const columns: ColumnDefinition<StockAdjustment>[] = [
    { 
      accessorKey: "date", 
      header: "Data",
      cell: (row) => new Date(row.date).toLocaleDateString('pt-BR'),
    },
    { accessorKey: "productName", header: "Produto" },
    { 
      accessorKey: "quantityChange", 
      header: "Alteração de Quantidade",
      cell: (row) => (
        <span className={row.quantityChange >= 0 ? "text-green-600" : "text-red-600"}>
          {row.quantityChange > 0 ? "+" : ""}{row.quantityChange}
        </span>
      )
    },
    { accessorKey: "reason", header: "Motivo" },
  ];

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Ajustes de Estoque" description="Registre alterações nos níveis do seu inventário.">
        <Button onClick={() => setIsModalOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Ajuste
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={stockAdjustments} caption="Histórico de ajustes de estoque." />

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) form.reset({ date: new Date(), quantityChange: 0, reason: "", productId: "" });
      }}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="font-headline">Novo Ajuste de Estoque</DialogTitle>
            <DialogDescription>
              Registre um novo ajuste nos níveis de estoque do produto.
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
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (Atual: {product.currentStock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quantityChange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alteração de Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="ex.: 10 ou -5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um motivo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {displayAdjustmentReasons.map(reason => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                     <Input 
                        className="mt-2"
                        placeholder="Ou digite um motivo personalizado" 
                        onChange={(e) => {
                            const customValue = e.target.value;
                            // If user types something, it becomes the custom reason
                            // If they then select from dropdown, this input should clear or reflect selection
                            // This simple onChange just sets the custom value.
                            // For a cleaner UX, might need more state to manage custom input vs. selection.
                            field.onChange(customValue);
                         }}
                        // Only show input text if it's a custom reason not in predefined list
                        value={displayAdjustmentReasons.includes(field.value) ? "" : field.value}
                      />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data do Ajuste</FormLabel>
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
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Adicionar Ajuste</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
