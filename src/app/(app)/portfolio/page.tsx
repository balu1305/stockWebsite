
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown, Landmark, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// TODO: Replace with actual data fetched from Firestore/backend
interface Holding {
    symbol: string;
    companyName: string;
    quantity: number;
    avgBuyPrice: number;
    currentPrice: number; // Need to fetch this live
    totalValue: number;
    profitLoss: number;
    profitLossPercent: number;
}

const MOCK_HOLDINGS: Holding[] = [
    { symbol: 'RELIANCE.NS', companyName: 'Reliance Industries Ltd.', quantity: 10, avgBuyPrice: 2400.50, currentPrice: 2450.75, totalValue: 24507.50, profitLoss: 502.50, profitLossPercent: 2.09 },
    { symbol: 'TCS.NS', companyName: 'Tata Consultancy Services Ltd.', quantity: 5, avgBuyPrice: 3500.00, currentPrice: 3480.20, totalValue: 17401.00, profitLoss: -99.00, profitLossPercent: -0.57 },
    { symbol: 'INFY.NS', companyName: 'Infosys Ltd.', quantity: 15, avgBuyPrice: 1500.00, currentPrice: 1550.00, totalValue: 23250.00, profitLoss: 750.00, profitLossPercent: 3.33 },
];

// TODO: Fetch actual balance from Firestore
const VIRTUAL_BALANCE = 934841.50; // Example remaining balance after trades

export default function PortfolioPage() {
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPortfolio = async () => {
            setLoading(true);
            setError(null);
            try {
                // TODO: Replace with actual API call to get holdings and fetch current prices
                // For now, using mock data and simulating delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                // In a real app, fetch current prices for each holding here
                setHoldings(MOCK_HOLDINGS);
            } catch (err) {
                console.error("Failed to fetch portfolio data:", err);
                setError("Failed to load portfolio data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, []);

    const calculateTotals = () => {
        const totalInvested = holdings.reduce((sum, h) => sum + (h.avgBuyPrice * h.quantity), 0);
        const totalCurrentValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
        const totalProfitLoss = totalCurrentValue - totalInvested;
        const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
        return { totalInvested, totalCurrentValue, totalProfitLoss, totalProfitLossPercent };
    };

    const totals = calculateTotals();

     const formatCurrency = (amount: number) => {
       return new Intl.NumberFormat('en-IN', {
         style: 'currency',
         currency: 'INR',
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
       }).format(amount);
     };

     const renderProfitLoss = (amount: number, percent: number) => {
        const isPositive = amount >= 0;
        const colorClass = isPositive ? 'text-accent' : 'text-destructive';
        const Icon = isPositive ? ArrowUp : ArrowDown;

        return (
         <span className={`inline-flex items-center ${colorClass}`}>
            <Icon className="mr-1 h-3 w-3" />
            {formatCurrency(amount)} ({percent.toFixed(2)}%)
         </span>
        );
     };


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Your Portfolio</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                     <BarChart3 className="h-4 w-4 text-muted-foreground" />
                   </CardHeader>
                   <CardContent>
                      {loading ? <Skeleton className="h-8 w-32"/> : <div className="text-2xl font-bold">{formatCurrency(totals.totalCurrentValue)}</div>}
                     <p className="text-xs text-muted-foreground">Total value of all holdings</p>
                   </CardContent>
                 </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                       <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                     {loading ? <Skeleton className="h-8 w-32"/> : <div className="text-2xl font-bold">{formatCurrency(totals.totalInvested)}</div>}
                      <p className="text-xs text-muted-foreground">Total cost of acquiring stocks</p>
                    </CardContent>
                  </Card>
                 <Card>
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">Overall P/L</CardTitle>
                     {totals.totalProfitLoss >= 0 ? <ArrowUp className="h-4 w-4 text-accent" /> : <ArrowDown className="h-4 w-4 text-destructive" />}
                   </CardHeader>
                   <CardContent>
                     {loading ? <Skeleton className="h-8 w-40"/> : <div className="text-2xl font-bold">{renderProfitLoss(totals.totalProfitLoss, totals.totalProfitLossPercent)}</div>}
                     <p className="text-xs text-muted-foreground">Total profit or loss across portfolio</p>
                   </CardContent>
                 </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
                      <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {/* TODO: Fetch actual available cash balance */}
                      {loading ? <Skeleton className="h-8 w-32"/> : <div className="text-2xl font-bold">{formatCurrency(VIRTUAL_BALANCE)}</div> }
                      <p className="text-xs text-muted-foreground">Virtual cash remaining</p>
                    </CardContent>
                  </Card>
            </div>


            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Holdings Details</CardTitle>
                    <CardDescription>Your current stock positions.</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-destructive text-center">{error}</p>}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead className="text-right">Avg. Buy Price</TableHead>
                                <TableHead className="text-right">Current Price</TableHead>
                                <TableHead className="text-right">Total Value</TableHead>
                                <TableHead className="text-right">Profit/Loss</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-24 inline-block" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-24 inline-block" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-28 inline-block" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-32 inline-block" /></TableCell>
                                    </TableRow>
                                ))
                            ) : holdings.length > 0 ? (
                                holdings.map((holding) => (
                                    <TableRow key={holding.symbol} className="hover:bg-secondary transition-colors duration-150">
                                        <TableCell className="font-medium">{holding.symbol}<br/><span className="text-xs text-muted-foreground">{holding.companyName}</span></TableCell>
                                        <TableCell>{holding.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(holding.avgBuyPrice)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(holding.currentPrice)}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(holding.totalValue)}</TableCell>
                                        <TableCell className="text-right">{renderProfitLoss(holding.profitLoss, holding.profitLossPercent)}</TableCell>
                                    </TableRow>
                                ))
                               ) : (
                                 <TableRow>
                                   <TableCell colSpan={6} className="text-center text-muted-foreground">
                                     You currently have no holdings. Start trading in the Market tab!
                                   </TableCell>
                                 </TableRow>
                               )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             {/* TODO: Add Transaction History Table */}
             <Card>
               <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Your recent buy and sell orders (coming soon).</CardDescription>
               </CardHeader>
               <CardContent>
                 <p className="text-muted-foreground">Transaction details will be displayed here.</p>
               </CardContent>
             </Card>
        </div>
    );
}
