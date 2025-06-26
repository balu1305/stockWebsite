
/**
 * Represents a stock quote with price and other details.
 */
export interface StockQuote {
  /**
   * The ticker symbol of the stock.
   */
  symbol: string;
  /**
   * The current price of the stock.
   */
  price: number;
  /**
   * The change in price since the last closing.
   */
  change: number;
  /**
   * The percentage change in price since the last closing.
   */
  percentChange: number;
  /**
   * The name of the company.
   */
  companyName: string;
}

// --- Potential API Integration Point ---
// Consider using APIs like:
// - Alpha Vantage (https://www.alphavantage.co/) - Free tier available, good for testing.
// - Finnhub (https://finnhub.io/) - Offers real-time and historical data.
// - Yahoo Finance API (unofficial wrappers exist, use with caution)
// Remember to handle API keys securely, potentially using environment variables.
// Example fetch (conceptual):
// async function fetchFromApi(symbol: string) {
//   const apiKey = process.env.NEXT_PUBLIC_STOCK_API_KEY;
//   const response = await fetch(`https://api.example.com/quote?symbol=${symbol}&apikey=${apiKey}`);
//   if (!response.ok) {
//      throw new Error(`Failed to fetch stock data for ${symbol}`);
//   }
//   const data = await response.json();
//   // Map API response structure to StockQuote interface
//   return { ... }
// }
// ---------------------------------------


// Mock Company Names mapping
const mockCompanyNames: { [key: string]: string } = {
  'RELIANCE.NS': 'Reliance Industries Ltd.',
  'TCS.NS': 'Tata Consultancy Services Ltd.',
  'HDFCBANK.NS': 'HDFC Bank Ltd.',
  'INFY.NS': 'Infosys Ltd.',
  'ICICIBANK.NS': 'ICICI Bank Ltd.',
  'HINDUNILVR.NS': 'Hindustan Unilever Ltd.',
  'SBIN.NS': 'State Bank of India',
  'BAJFINANCE.NS': 'Bajaj Finance Ltd.',
  'BHARTIARTL.NS': 'Bharti Airtel Ltd.',
  'KOTAKBANK.NS': 'Kotak Mahindra Bank Ltd.',
};

// Enhanced Mock Data Generation
function generateMockQuote(symbol: string): StockQuote {
  const basePrice = Math.random() * 3000 + 500; // Random base price between 500 and 3500
  const change = (Math.random() - 0.5) * basePrice * 0.05; // Random change up to 5% of base price
  const price = parseFloat((basePrice + change).toFixed(2));
  const percentChange = parseFloat(((change / basePrice) * 100).toFixed(2));
  const companyName = mockCompanyNames[symbol] || `${symbol.split('.')[0]} Example Corp.`;

  return {
    symbol: symbol,
    price: price,
    change: parseFloat(change.toFixed(2)),
    percentChange: percentChange,
    companyName: companyName,
  };
}


/**
 * Asynchronously retrieves stock quote data for a given stock symbol.
 *
 * @param symbol The stock symbol to retrieve data for.
 * @returns A promise that resolves to a StockQuote object.
 */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  // TODO: Implement this by calling an API such as Yahoo Finance, Alpha Vantage, or Finnhub.
  console.log(`[Mock Service] Getting quote for: ${symbol}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));

  // Simulate API failure possibility (e.g., invalid ticker)
  if (symbol.startsWith('INVALID')) {
     throw new Error(`Stock symbol "${symbol}" not found.`);
  }


  return generateMockQuote(symbol);
}

/**
 * Asynchronously retrieves stock quote data for multiple stock symbols.
 *
 * @param symbols An array of stock symbols to retrieve data for.
 * @returns A promise that resolves to an array of StockQuote objects.
 */
export async function getStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  // TODO: Implement this by calling an API. Efficient APIs often allow batch requests.
  console.log(`[Mock Service] Getting quotes for: ${symbols.join(', ')}`);
  // Simulate network delay for batch request
   await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));


   // Sequentially generate mocks (in a real API, this would likely be parallel or batch)
   const quotes = symbols.map(symbol => generateMockQuote(symbol));

  return quotes;
}

