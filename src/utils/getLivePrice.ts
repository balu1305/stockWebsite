import yahooFinance from "yahoo-finance2";

export async function getLivePrice(symbol: string) {
  try {
    const quote = await yahooFinance.quote(symbol);
    return {
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      changePercent: quote.regularMarketChangePercent
    };
  } catch (error) {
    console.error(`Error fetching live price for ${symbol}`, error);
    return null;
  }
}
