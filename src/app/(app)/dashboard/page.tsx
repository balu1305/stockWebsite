
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// No longer need useAuthContext or Skeleton for auth loading
import { Landmark } from "lucide-react";

// TODO: Fetch actual balance from Firestore or use a fixed value
const INITIAL_VIRTUAL_BALANCE = 1000000; // 10 Lakh INR

export default function DashboardPage() {
  // No need for user or loading state from useAuthContext

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0, // Show whole rupees
    }).format(amount);
  };

  // Remove the loading/skeleton block

  return (
    <div className="space-y-6">
      {/* Changed greeting to be generic */}
      <h1 className="text-3xl font-bold text-primary">Welcome to StockSim India!</h1>

      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">
            Virtual Balance
          </CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(INITIAL_VIRTUAL_BALANCE)}</div>
          <CardDescription className="text-xs text-muted-foreground pt-1">
            Your starting virtual capital for trading.
          </CardDescription>
        </CardContent>
      </Card>

       {/* TODO: Add more dashboard cards here later (e.g., Portfolio Summary, Watchlist, Recent Trades) */}
       <Card>
          <CardHeader>
             <CardTitle>Market Overview</CardTitle>
             <CardDescription>Quick look at major indices (coming soon).</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Indices data will be displayed here.</p>
          </CardContent>
       </Card>
        <Card>
           <CardHeader>
              <CardTitle>Your Holdings</CardTitle>
              <CardDescription>Summary of your current investments (coming soon).</CardDescription>
           </CardHeader>
           <CardContent>
               <p className="text-muted-foreground">Portfolio details will be displayed here.</p>
           </CardContent>
        </Card>

    </div>
  );
}
