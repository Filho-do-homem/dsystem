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
import { Label } from "@/components/ui/label";
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
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";


const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantityChange: z.coerce.number().int().refine(val => val !== 0, "Quantity change cannot be zero"),
  reason: z.string().min(1, "Reason is required").max(100, "Reason is too long"),
  date: z.date({ required_error: "Date is required." }),
});

type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

const adjustmentReasons = ["New Batch", "Stock Count Correction", "Damaged Goods", "Returned Item", "Promotion/Gift", "Other"];

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
        reason: data.reason,
        date: data.date.toISOString(),
      });
      toast({ title: "Success", description: "Stock adjustment recorded successfully." });
      setIsModalOpen(false);
      form.reset({ date: new Date(), quantityChange: 0 }); // Reset with current date
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: String(error) || "Failed to record stock adjustment." });
      console.error(error);
    }
  };

  const columns: ColumnDefinition<StockAdjustment>[] = [
    { 
      accessorKey: "date", 
      header: "Date",
      cell: (row) => new Date(row.date).toLocaleDateString(),
    },
    { accessorKey: "productName", header: "Product" },
    { 
      accessorKey: "quantityChange", 
      header: "Quantity Change",
      cell: (row) => (
        <span className={row.quantityChange >= 0 ? "text-green-600" : "text-red-600"}>
          {row.quantityChange > 0 ? "+" : ""}{row.quantityChange}
        </span>
      )
    },
    { accessorKey: "reason", header: "Reason" },
  ];

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Stock Adjustments" description="Record changes to your inventory levels.">
        <Button onClick={() => setIsModalOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Adjustment
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={stockAdjustments} caption="History of stock adjustments." />

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) form.reset({ date: new Date(), quantityChange: 0 });
      }}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="font-headline">New Stock Adjustment</DialogTitle>
            <DialogDescription>
              Record a new adjustment to product stock levels.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (Current: {product.currentStock})
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
                    <FormLabel>Quantity Change</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 10 or -5" {...field} />
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
                    <FormLabel>Reason</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {adjustmentReasons.map(reason => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                         {field.value && !adjustmentReasons.includes(field.value) && (
                            <SelectItem value={field.value} disabled>
                              {field.value} (Custom)
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                    {/* Allow custom reason if 'Other' selected perhaps, or just a text input */}
                    {/* For simplicity, if reason is not in list, it's custom */}
                     <Input 
                        className="mt-2"
                        placeholder="Or type a custom reason" 
                        onChange={(e) => field.onChange(e.target.value)} 
                        value={adjustmentReasons.includes(field.value) ? "" : field.value}
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
                    <FormLabel>Adjustment Date</FormLabel>
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
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
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
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                 <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                 </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Adjustment</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
