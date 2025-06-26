import yfinance as yf
import datetime as dt

def test_ticker(ticker):
    """Test if a ticker works with yfinance"""
    print(f"\nTesting ticker: {ticker}")
    try:
        # Create ticker object
        stock = yf.Ticker(ticker)
        
        # Try to get info
        info = stock.info
        print(f"  Company name: {info.get('longName', 'N/A')}")
        print(f"  Currency: {info.get('currency', 'N/A')}")
        print(f"  Exchange: {info.get('exchange', 'N/A')}")
        
        # Try to get recent data
        end_date = dt.datetime.now()
        start_date = end_date - dt.timedelta(days=30)
        
        data = yf.download(ticker, start=start_date, end=end_date, progress=False)
        if not data.empty:
            print(f"  ✅ Data available: {len(data)} days")
            print(f"  Latest close: ${data['Close'].iloc[-1]:.2f}")
            return True
        else:
            print(f"  ❌ No historical data available")
            return False
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

# Test common tickers
tickers_to_test = [
    "AAPL",      # Apple
    "MSFT",      # Microsoft
    "GOOGL",     # Google
    "TSLA",      # Tesla
    "RELIANCE.NS", # Reliance (Indian)
    "TCS.NS",    # TCS (Indian)
    "INFY.NS",   # Infosys (Indian)
]

print("Testing Yahoo Finance connectivity...")
print("=" * 50)

working_tickers = []
for ticker in tickers_to_test:
    if test_ticker(ticker):
        working_tickers.append(ticker)

print("\n" + "=" * 50)
print(f"Working tickers: {working_tickers}")
print(f"Total working: {len(working_tickers)}/{len(tickers_to_test)}")

if working_tickers:
    print(f"\n✅ Yahoo Finance is working! Try using: {working_tickers[0]}")
else:
    print("\n❌ Yahoo Finance seems to have issues. Check your internet connection.")
