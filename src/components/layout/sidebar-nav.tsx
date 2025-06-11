
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
  LogOut, // Import LogOut icon
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
import { SheetTitle } from "@/components/ui/sheet"
import { useSidebar } from "@/components/ui/sidebar"
import type React from 'react';
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

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
    strokeWidth="4.5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 8 V 52 H30 C45 52 50 42 50 30 C50 18 45 8 30 8 H15 Z" />
    <path d="M25 21 H34 Q37 21 37 24 V26 Q37 29 34 29 H28 Q25 29 25 32 V34 Q25 37 28 37 H37" />
    <path d="M49 5 h5 v5 h-5 Z" />
  </svg>
);


export function SidebarNav() {
  const pathname = usePathname()
  const { isMobile, toggleSidebar } = useSidebar();
  const { logout } = useAuth(); // Get logout function


  return (
    <Sidebar variant="sidebar" collapsible={isMobile ? "offcanvas" : "icon"}>
      <SidebarHeader className="p-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <DSIcon className="h-7 w-7 text-primary" />
          {isMobile && pathname !== "/login" ? (
            <SheetTitle asChild>
              <h1 className="text-xl font-semibold font-headline">D'System</h1>
            </SheetTitle>
          ) : (
            <h1 className="text-xl font-semibold font-headline">D'System</h1>
          )}
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
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={logout}
                    tooltip={{ children: "Sair", side: "right", className: "ml-2"}}
                    className="w-full" 
                >
                    <LogOut />
                    <span>Sair</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
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
