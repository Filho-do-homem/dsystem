
"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from "@/contexts/AppContext";
import type { Sale, ScannedItem, Product } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDefinition } from "@/components/common/DataTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
  TableFooter,
} from "@/components/ui/table"
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { PlusCircle, CalendarIcon, ScanLine, Trash2, CircleX, AlertTriangle } from "lucide-react";
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
  const { products, sales, addSale, getProductById, getProductByBarcode, clearSales } = useAppContext();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("manual");
  const [barcodeInput, setBarcodeInput] = React.useState("");
  const [scannedItems, setScannedItems] = React.useState<ScannedItem[]>([]);
  const barcodeInputRef = React.useRef<HTMLInputElement>(null);
  const [isClearSalesDialogOpen, setIsClearSalesDialogOpen] = React.useState(false);


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
  
  React.useEffect(() => {
    if (activeTab === 'barcode' && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [activeTab]);


  const onSubmitManualSale: SubmitHandler<SaleFormData> = (data) => {
    const product = getProductById(data.productId);
    if (!product) {
      toast({ variant: "destructive", title: "Erro", description: "Produto selecionado não encontrado." });
      return;
    }
    if (product.currentStock < data.quantitySold) {
       toast({ variant: "destructive", title: "Erro", description: `Estoque insuficiente para ${product.name}. Disponível: ${product.currentStock}` });
       return;
    }

    try {
        addSale({
            productId: data.productId,
            quantitySold: data.quantitySold,
            pricePerItem: data.pricePerItem,
            saleDate: data.saleDate.toISOString(),
        });
        toast({ title: "Sucesso", description: "Venda registrada com sucesso." });
        setIsModalOpen(false);
        form.reset({ saleDate: new Date(), quantitySold: 1, pricePerItem: 0, productId: "" });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erro", description: error.message || "Falha ao registrar venda."})
    }
  };

  const handleBarcodeAdd = () => {
    if (!barcodeInput.trim()) return;
    const product = getProductByBarcode(barcodeInput.trim());

    if (product) {
      if (product.currentStock <= 0) {
        toast({ variant: "destructive", title: "Fora de Estoque", description: `Produto ${product.name} está fora de estoque.` });
        setBarcodeInput("");
        return;
      }

      setScannedItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id);
        if (existingItemIndex > -1) {
          const updatedItems = [...prevItems];
          const existingItem = updatedItems[existingItemIndex];
          if (existingItem.quantity < product.currentStock) {
            updatedItems[existingItemIndex] = { ...existingItem, quantity: existingItem.quantity + 1 };
          } else {
             toast({ variant: "destructive", title: "Estoque Insuficiente", description: `Não há mais unidades de ${product.name} em estoque para adicionar.` });
          }
          return updatedItems;
        } else {
          return [...prevItems, { product, quantity: 1 }];
        }
      });
      setBarcodeInput("");
    } else {
      toast({ variant: "destructive", title: "Não Encontrado", description: "Produto com este código de barras não encontrado." });
    }
     if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const handleBarcodeKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleBarcodeAdd();
    }
  };
  
  const handleRemoveScannedItem = (productId: string) => {
    setScannedItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const handleClearScannedItems = () => {
    setScannedItems([]);
  };

  const handleFinalizeBarcodeSale = () => {
    if (scannedItems.length === 0) {
      toast({ variant: "destructive", title: "Atenção", description: "Nenhum item escaneado para finalizar a venda." });
      return;
    }
    let successCount = 0;
    let errorCount = 0;
    const saleDate = new Date().toISOString();

    scannedItems.forEach(item => {
      try {
        addSale({
          productId: item.product.id,
          quantitySold: item.quantity,
          pricePerItem: item.product.sellingPrice,
          saleDate: saleDate,
        });
        successCount++;
      } catch (error: any) {
        toast({ variant: "destructive", title: `Erro ao vender ${item.product.name}`, description: error.message });
        errorCount++;
      }
    });

    if (successCount > 0) {
      toast({ title: "Sucesso Parcial ou Total", description: `${successCount} tipo(s) de produto(s) vendido(s) com sucesso.` });
    }
    if (errorCount === 0 && successCount > 0) {
        setScannedItems([]); 
    } else if (errorCount > 0 && successCount === 0) {
        toast({variant: "destructive", title: "Falha na Venda", description: "Nenhum produto foi vendido. Verifique os erros."})
    }
     if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };
  
  const totalScannedAmount = React.useMemo(() => {
    return scannedItems.reduce((total, item) => total + (item.product.sellingPrice * item.quantity), 0);
  }, [scannedItems]);


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
  
  const sortedSales = React.useMemo(() => 
    [...sales].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()), 
    [sales]
  );

  const handleConfirmClearSales = () => {
    clearSales();
    toast({ title: "Sucesso", description: "Histórico de vendas limpo." });
    setIsClearSalesDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Vendas" description="Registre novas vendas e veja o histórico de transações.">
        <Button 
          onClick={() => {
            setActiveTab("manual"); 
            setIsModalOpen(true);
          }} 
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Registrar Venda Manual
        </Button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3">
          <TabsTrigger value="manual">Registro Manual</TabsTrigger>
          <TabsTrigger value="barcode">Leitor de Código de Barras</TabsTrigger>
        </TabsList>
        <TabsContent value="manual">
          <p className="text-sm text-muted-foreground mb-4">
            Use esta aba para registrar vendas selecionando produtos manualmente e especificando quantidades.
          </p>
        </TabsContent>
        <TabsContent value="barcode">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><ScanLine className="mr-2 h-6 w-6 text-primary"/> Leitura de Código de Barras</CardTitle>
              <CardDescription>Use um leitor de código de barras para adicionar produtos rapidamente à venda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <Label htmlFor="barcode-input" className="mb-1 block text-sm font-medium">Código de Barras</Label>
                  <Input
                    ref={barcodeInputRef}
                    id="barcode-input"
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={handleBarcodeKeyDown}
                    placeholder="Escaneie ou digite o código aqui"
                    className="text-base"
                  />
                </div>
                <Button onClick={handleBarcodeAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlusCircle className="mr-2 h-4 w-4"/> Adicionar
                </Button>
              </div>

              {scannedItems.length > 0 && (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-center">Qtd.</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-center">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scannedItems.map(item => (
                        <TableRow key={item.product.id}>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">R${item.product.sellingPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">R${(item.product.sellingPrice * item.quantity).toFixed(2)}</TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveScannedItem(item.product.id)} className="text-destructive hover:text-destructive/80">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                     <TableFooter>
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={3} className="text-right font-semibold text-lg">Total da Venda</TableCell>
                          <TableCell className="text-right font-semibold text-lg">R${totalScannedAmount.toFixed(2)}</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableFooter>
                  </Table>
                </div>
              )}
               {scannedItems.length === 0 && (
                 <p className="text-center text-muted-foreground py-4">Nenhum item escaneado ainda.</p>
               )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={handleClearScannedItems} disabled={scannedItems.length === 0}>
                  <CircleX className="mr-2 h-4 w-4"/> Limpar Itens
                </Button>
                <Button onClick={handleFinalizeBarcodeSale} disabled={scannedItems.length === 0} className="bg-green-600 hover:bg-green-700 text-white">
                  Finalizar Venda com Itens Lidos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between items-center my-6">
        <h2 className="text-2xl font-semibold tracking-tight font-headline">Histórico de Vendas</h2>
        {sales.length > 0 && (
            <AlertDialog open={isClearSalesDialogOpen} onOpenChange={setIsClearSalesDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        <Trash2 className="mr-2 h-4 w-4" /> Limpar Histórico de Vendas
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                        Confirmar Exclusão
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza de que deseja limpar todo o histórico de vendas? Esta ação não pode ser desfeita e os dados de vendas serão perdidos permanentemente.
                        Os ajustes de estoque relacionados a estas vendas não serão revertidos.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirmClearSales}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                        Confirmar e Limpar
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
      </div>
      <DataTable columns={columns} data={sortedSales} caption="Histórico de transações de venda." />

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) form.reset({ saleDate: new Date(), quantitySold: 1, pricePerItem: 0, productId: "" });
      }}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="font-headline">Registrar Nova Venda Manual</DialogTitle>
            <DialogDescription>
              Insira os detalhes da transação de venda.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitManualSale)} className="space-y-4 py-4">
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

    
