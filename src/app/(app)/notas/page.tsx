
"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from "@/contexts/AppContext";
import type { Nota } from "@/types";
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

const notaSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantity: z.coerce.number().int().min(1, "Quantidade deve ser no mínimo 1"),
  noteNumber: z.string().max(50, "Número da nota muito longo").optional(),
  date: z.date({ required_error: "Data da nota é obrigatória." }),
});

type NotaFormData = z.infer<typeof notaSchema>;

export default function NotasPage() {
  const { products, notas, addNota } = useAppContext();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<NotaFormData>({
    resolver: zodResolver(notaSchema),
    defaultValues: {
      productId: "",
      quantity: 1,
      noteNumber: "",
      date: new Date(),
    },
  });

  const onSubmit: SubmitHandler<NotaFormData> = (data) => {
    try {
      addNota({
        productId: data.productId,
        quantity: data.quantity,
        noteNumber: data.noteNumber,
        date: data.date.toISOString(),
      });
      toast({ title: "Sucesso", description: "Nota registrada com sucesso. Estoque atualizado." });
      setIsModalOpen(false);
      form.reset({ date: new Date(), quantity: 1, noteNumber: "", productId: "" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message || "Falha ao registrar nota." });
      console.error(error);
    }
  };

  const columns: ColumnDefinition<Nota>[] = [
    { 
      accessorKey: "date", 
      header: "Data da Nota",
      cell: (row) => new Date(row.date).toLocaleDateString('pt-BR'),
    },
    { accessorKey: "productName", header: "Produto" },
    { 
      accessorKey: "quantity", 
      header: "Quantidade Entrada",
      cell: (row) => (
        <span className="text-green-600">
          +{row.quantity}
        </span>
      )
    },
    { accessorKey: "noteNumber", header: "Nº da Nota/Lote" },
  ];
  
  const sortedNotas = React.useMemo(() => 
    [...notas].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
    [notas]
  );

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Notas de Entrada/Produção" description="Registre novas entradas de produtos no estoque.">
        <Button onClick={() => setIsModalOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nota
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={sortedNotas} caption="Histórico de notas de entrada/produção." />

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) form.reset({ date: new Date(), quantity: 1, noteNumber: "", productId: "" });
      }}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="font-headline">Adicionar Nova Nota</DialogTitle>
            <DialogDescription>
              Insira os detalhes da nota para adicionar produtos ao estoque.
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
                            {product.name} (Estoque Atual: {product.currentStock})
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade de Entrada</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noteNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Nota/Lote (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="ex: NF-00123, LOTE-XYZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Nota</FormLabel>
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
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Adicionar Nota</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
