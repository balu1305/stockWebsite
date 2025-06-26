
"use client";

import React, { useState, useEffect } from 'react';
import { getStockQuotes, type StockQuote } from '@/services/stock-data'; // Using placeholder service
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// TODO: Replace with actual list of popular Indian stocks
const DEFAULT_SYMBOLS = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'HINDUNILVR.NS', 'SBIN.NS', 'BAJFINANCE.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS'];

export default function MarketPage() {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real app, you might fetch based on search or pagination
        const quotes = await getStockQuotes(DEFAULT_SYMBOLS);
        setStocks(quotes);
      } catch (err) {
        console.error("Failed to fetch stock quotes:", err);
        setError("Failed to load stock data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();

    // TODO: Implement real-time updates (e.g., via WebSockets or polling)
    // const interval = setInterval(fetchStocks, 30000); // Example polling every 30s
    // return () => clearInterval(interval);

  }, []);

  const handleBuy = (symbol: string) => {
    console.log(`Initiate buy for ${symbol}`);
    // TODO: Implement buy modal/logic
    alert(`Buying ${symbol} (feature coming soon!)`);
  };

  const handleSell = (symbol: string) => {
    console.log(`Initiate sell for ${symbol}`);
    // TODO: Implement sell modal/logic
     alert(`Selling ${symbol} (feature coming soon!)`);
  };

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

   const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const renderPriceChange = (change: number, percentChange: number) => {
    const isPositive = change >= 0;
    const colorClass = isPositive ? 'text-accent' : 'text-destructive'; // Using theme colors
    const Icon = isPositive ? ArrowUp : ArrowDown;

    return (
      <Badge variant={isPositive ? 'default' : 'destructive'} className={`${colorClass} bg-opacity-10`}>
          <Icon className={`mr-1 h-3 w-3 ${colorClass}`} />
          {formatCurrency(change)} ({percentChange.toFixed(2)}%)
      </Badge>
    );
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Market Watch</h1>
      <Card className="shadow-md">
         <CardHeader>
            <CardTitle>Stock List</CardTitle>
            <CardDescription>Live prices for Nifty 50 stocks (placeholder data).</CardDescription>
             <Input
               placeholder="Search by symbol or company name..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="max-w-sm"
             />
         </CardHeader>
        <CardContent>
          {error && <p className="text-destructive text-center">{error}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-24 inline-block" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-28 inline-block" /></TableCell>
                    <TableCell className="text-center space-x-2">
                        <Skeleton className="h-8 w-16 inline-block rounded-md" />
                        <Skeleton className="h-8 w-16 inline-block rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredStocks.length > 0 ? (
                 filteredStocks.map((stock) => (
                  <TableRow key={stock.symbol} className="hover:bg-secondary transition-colors duration-150">
                    <TableCell className="font-medium">{stock.symbol}</TableCell>
                    <TableCell className="text-muted-foreground">{stock.companyName}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(stock.price)}</TableCell>
                    <TableCell className="text-right">{renderPriceChange(stock.change, stock.percentChange)}</TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="outline" size="sm" className="text-accent border-accent hover:bg-accent hover:text-accent-foreground" onClick={() => handleBuy(stock.symbol)}>
                        <ShoppingCart className="mr-1 h-4 w-4" /> Buy
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleSell(stock.symbol)}>
                         <DollarSign className="mr-1 h-4 w-4" /> Sell
                      </Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => alert(`View details for ${stock.symbol} (coming soon)`)}>
                         <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="sr-only">View Prediction</span>
                       </Button>
                    </TableCell>
                  </TableRow>
                 ))
               ) : (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center text-muted-foreground">
                     No stocks found matching your search.
                   </TableCell>
                 </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
