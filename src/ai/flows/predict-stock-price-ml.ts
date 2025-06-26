'use server';
/**
 * @fileOverview ML-based stock price prediction flow
 * 
 * This replaces the Gemini-based prediction with our custom LSTM model
 */

import { z } from 'zod';
import { mlStockPredictionService } from '@/services/ml-prediction';

const PredictStockPriceInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock to predict.'),
});
export type PredictStockPriceInput = z.infer<typeof PredictStockPriceInputSchema>;

const PredictStockPriceOutputSchema = z.object({
  predictedPrice: z.number().describe('The predicted stock price for the next day.'),
  explanation: z.string().describe('Explanation of why the price is predicted to be this value.')
});
export type PredictStockPriceOutput = z.infer<typeof PredictStockPriceOutputSchema>;

/**
 * Predict stock price using ML model
 */
export async function predictStockPriceML(input: PredictStockPriceInput): Promise<PredictStockPriceOutput> {
  try {
    // Validate input
    const validatedInput = PredictStockPriceInputSchema.parse(input);
    
    // Call ML prediction service
    const result = await mlStockPredictionService.predictStockPrice({
      ticker: validatedInput.ticker
    });
    
    // Validate output
    return PredictStockPriceOutputSchema.parse(result);
    
  } catch (error) {
    console.error('ML Stock Prediction Error:', error);
    
    if (error instanceof Error) {
      throw new Error(`Stock prediction failed: ${error.message}`);
    }
    
    throw new Error('Unknown error occurred during stock prediction');
  }
}
