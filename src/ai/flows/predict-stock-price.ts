'use server';
/**
 * @fileOverview Predicts the stock price for the next day using an AI model.
 *
 * - predictStockPrice - Predicts the stock price for the next day.
 * - PredictStockPriceInput - Input for predictStockPrice.
 * - PredictStockPriceOutput - Output for predictStockPrice.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getStockQuote} from '@/services/stock-data';

const PredictStockPriceInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock to predict.'),
});
export type PredictStockPriceInput = z.infer<typeof PredictStockPriceInputSchema>;

const PredictStockPriceOutputSchema = z.object({
  predictedPrice: z.number().describe('The predicted stock price for the next day.'),
  explanation: z.string().describe('Explanation of why the price is predicted to be this value.')
});
export type PredictStockPriceOutput = z.infer<typeof PredictStockPriceOutputSchema>;

export async function predictStockPrice(input: PredictStockPriceInput): Promise<PredictStockPriceOutput> {
  return predictStockPriceFlow(input);
}

const predictStockPricePrompt = ai.definePrompt({
  name: 'predictStockPricePrompt',
  input: {
    schema: z.object({
      ticker: z.string().describe('The ticker symbol of the stock to predict.'),
      currentPrice: z.number().describe('The current price of the stock.'),
    }),
  },
  output: {
    schema: z.object({
      predictedPrice: z.number().describe('The predicted stock price for the next day.'),
      explanation: z.string().describe('Explanation of why the price is predicted to be this value.')
    }),
  },
  prompt: `You are an AI stock market analyst. You will predict the price of a stock for the next day, based on the current price. You will provide a brief explanation of your prediction.

  Today's date is {{currentDate}}.
  The ticker symbol is: {{{ticker}}}
  The current price is: {{{currentPrice}}}

  Respond with a predicted price and explanation.
`,
});

const predictStockPriceFlow = ai.defineFlow<
  typeof PredictStockPriceInputSchema,
  typeof PredictStockPriceOutputSchema
>(
  {
    name: 'predictStockPriceFlow',
    inputSchema: PredictStockPriceInputSchema,
    outputSchema: PredictStockPriceOutputSchema,
  },
  async input => {
    const stockQuote = await getStockQuote(input.ticker);
    const currentDate = new Date().toLocaleDateString();

    const {output} = await predictStockPricePrompt({
      ticker: input.ticker,
      currentPrice: stockQuote.price,
      currentDate: currentDate,
    });
    return output!;
  }
);
