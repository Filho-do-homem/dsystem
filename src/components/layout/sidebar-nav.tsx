
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  ArchiveRestore, 
  ShoppingCart, 
  BarChartHorizontalBig,
  FileText,
  type LucideIcon
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from '@/components/ui/button'
import { useSidebar } from "@/components/ui/sidebar"
import type React from 'react';

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/products", label: "Produtos", icon: Package },
  { href: "/notas", label: "Notas", icon: FileText },
  { href: "/stock-adjustments", label: "Ajustes de Estoque", icon: ArchiveRestore },
  { href: "/sales", label: "Vendas", icon: ShoppingCart },
  { href: "/stock-levels", label: "Níveis de Estoque", icon: BarChartHorizontalBig },
]

const DSIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 60 60"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* D Shape: Straight bar on the left, curve on the right */}
    <path d="M 12 5 L 12 55 Q 55 30 12 5 Z" />
    {/* S Shape: Centered wave inside the D */}
    <path d="M 22 15 Q 37 15 30 30 Q 22 45 37 45" />
  </svg>
);


export function SidebarNav() {
  const pathname = usePathname()
  const { isMobile, toggleSidebar } = useSidebar();


  return (
    <Sidebar variant="sidebar" collapsible={isMobile ? "offcanvas" : "icon"}>
      <SidebarHeader className="p-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <DSIcon className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-semibold font-headline">D'System</h1>
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                tooltip={{ children: item.label, side: "right", className: "ml-2"}}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
         <div className="p-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
           © {new Date().getFullYear()} D'System
         </div>
      </SidebarFooter>
    </Sidebar>
  )
}

const PanelLeftOpen = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("lucide lucide-panel-left-open", className)}>
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <path d="M9 3v18"/>
    <path d="m14 9 3 3-3 3"/>
  </svg>
);

