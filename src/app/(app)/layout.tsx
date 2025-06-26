
"use client";

import * as React from 'react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button'; // Keep Button if needed elsewhere, maybe remove if only used for user dropdown trigger
import {
  LayoutDashboard,
  CandlestickChart,
  Landmark,
  TrendingUp,
  BarChart,
  Info, // Example: Replace user/settings/logout with a generic item if needed
} from 'lucide-react';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  // No need for useAuthContext, useEffect for redirection, or handleLogout

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 border-b border-sidebar-border">
           <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground">
             <Landmark className="h-6 w-6 text-sidebar-primary" />
             <span>StockSim India</span>
           </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
               {/* Example: setting initial active item - adjust logic as needed */}
              <SidebarMenuButton asChild isActive={true} tooltip="Dashboard">
                 <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                 </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Market">
                 <Link href="/market">
                   <CandlestickChart />
                   <span>Market</span>
                  </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Portfolio">
                 <Link href="/portfolio">
                  <BarChart />
                  <span>Portfolio</span>
                 </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Predictions">
                 <Link href="/predictions">
                   <TrendingUp />
                   <span>AI Predictions</span>
                 </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
         <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto">
            {/* Removed user dropdown menu. Add alternative footer content if desired */}
            <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
                <Info className="h-4 w-4" />
                <span>Virtual Trading Sim</span>
            </div>
         </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 justify-between md:justify-end">
           <SidebarTrigger className="md:hidden"/> {/* Only show trigger on mobile */}
           {/* Add other header elements like search or notifications if needed */}
         </header>
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
