import time
import yfinance as yf
import datetime as dt

def wait_and_test_single_ticker(ticker='AAPL', wait_time=60):
    """Wait for rate limiting to clear and test a single ticker"""
    print(f"Waiting {wait_time} seconds for Yahoo Finance rate limiting to clear...")
    print("(This helps avoid 429 errors)")
    
    # Countdown timer
    for i in range(wait_time, 0, -10):
        print(f"  {i} seconds remaining...")
        time.sleep(10)
    
    print(f"\nTesting {ticker} after waiting...")
    
    try:
        end_date = dt.datetime.now()
        start_date = end_date - dt.timedelta(days=30)
        
        data = yf.download(
            ticker,
            start=start_date,
            end=end_date,
            progress=False,
            threads=False,
            timeout=30
        )
        
        if not data.empty:
            print(f"✅ SUCCESS: Got {len(data)} days of data for {ticker}")
            print(f"   Date range: {data.index[0].date()} to {data.index[-1].date()}")
            print(f"   Latest price: ${data['Close'].iloc[-1]:.2f}")
            return True
        else:
            print(f"❌ No data returned for {ticker}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing {ticker}: {e}")
        return False

if __name__ == "__main__":
    print("Yahoo Finance Rate Limit Recovery Tool")
    print("=" * 50)
    
    # Test with a minimal wait first
    if wait_and_test_single_ticker('AAPL', 30):
        print("\n✅ Yahoo Finance is working!")
    else:
        print("\n⚠ Still having issues. You may need to:")
        print("  1. Wait longer (Yahoo Finance may have longer rate limits)")
        print("  2. Check your internet connection")
        print("  3. Try a different network or VPN")
        print("  4. The system will automatically use mock data as fallback")
