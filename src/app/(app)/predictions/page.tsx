"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  predictStockPriceML,
  type PredictStockPriceOutput,
} from "@/ai/flows/predict-stock-price-ml";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, TrendingUp, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const predictionSchema = z.object({
  ticker: z
    .string()
    .min(1, { message: "Ticker symbol is required." })
    .regex(/^[A-Z0-9.-]+$/i, {
      message: "Invalid ticker format (e.g., RELIANCE.NS)",
    }),
});

export default function PredictionsPage() {
  const [prediction, setPrediction] = useState<PredictStockPriceOutput | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTicker, setCurrentTicker] = useState<string | null>(null);

  const form = useForm<z.infer<typeof predictionSchema>>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      ticker: "",
    },
  });

  async function onSubmit(values: z.infer<typeof predictionSchema>) {
    setLoading(true);
    setError(null);
    setPrediction(null); // Clear previous prediction
    setCurrentTicker(values.ticker.toUpperCase()); // Store the ticker being predicted

    try {
      const result = await predictStockPriceML({
        ticker: values.ticker.toUpperCase(),
      });
      setPrediction(result);
    } catch (err) {
      console.error("Prediction error:", err);
      let message =
        "Failed to get prediction. Please check the ticker symbol and try again.";
      if (err instanceof Error) {
        if (err.message.includes("not found")) {
          message = `Could not find data for ticker: ${values.ticker.toUpperCase()}. Please verify the symbol.`;
        } else if (
          err.message.includes("ML prediction service is not available")
        ) {
          message =
            "ML prediction service is currently unavailable. Please ensure the Python API server is running.";
        } else {
          message = err.message;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <TrendingUp className="mr-2 h-7 w-7" />
          ML Stock Prediction
        </h1>
      </div>

      <Alert variant="default" className="bg-secondary">
        <Info className="h-4 w-4" />
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>
          This tool uses an LSTM machine learning model trained on historical
          stock data and technical indicators. Predictions are based on pattern
          analysis and should <strong>not</strong> be considered financial
          advice. Stock market investments involve significant risk.
        </AlertDescription>
      </Alert>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Predict Next Day Price</CardTitle>
          <CardDescription>
            Enter a stock ticker symbol (e.g., AAPL, RELIANCE.NS) to get an LSTM
            neural network prediction for the next trading day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col sm:flex-row gap-4 items-start"
            >
              <FormField
                control={form.control}
                name="ticker"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full sm:w-auto">
                    <FormLabel className="sr-only">Ticker Symbol</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., AAPL, INFY.NS"
                        {...field}
                        className="uppercase"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {loading ? "Analyzing with ML Model..." : "Get ML Prediction"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      )}

      {error && !loading && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {prediction && !loading && currentTicker && (
        <Card className="shadow-lg border-primary border-opacity-50 animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="text-xl text-primary">
              ML Prediction for {currentTicker}
            </CardTitle>
            <CardDescription>
              LSTM neural network forecast for the next trading day.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(prediction.predictedPrice)}
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Explanation:</h4>
              <p className="text-muted-foreground leading-relaxed">
                {prediction.explanation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
