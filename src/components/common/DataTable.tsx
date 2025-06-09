"use client"

import * as React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export interface ColumnDefinition<T> {
  accessorKey: keyof T | string; // Allow string for custom accessors/renderers
  header: string | React.ReactNode;
  cell?: (row: T) => React.ReactNode; // Custom cell renderer
  size?: number; // For column width (flex-basis percentage or fixed pixels)
}

interface DataTableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  caption?: string;
  emptyStateMessage?: string;
}

export function DataTable<T>({ columns, data, caption, emptyStateMessage = "No data available." }: DataTableProps<T>) {
  return (
    <ScrollArea className="rounded-md border shadow-sm">
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={String(column.accessorKey)} 
                style={column.size ? { width: `${column.size}px`, minWidth: `${column.size}px` } : {}}
                className="font-semibold"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {columns.map((column) => (
                  <TableCell key={`cell-${rowIndex}-${String(column.accessorKey)}`}>
                    {column.cell
                      ? column.cell(row)
                      : String( (row as any)[column.accessorKey] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {emptyStateMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
