# Yahoo Finance Troubleshooting Guide

## Common Issues and Solutions

### 1. Rate Limiting (429 Errors) - MOST COMMON

**Symptoms:**

- "429 Client Error: Too Many Requests"
- "Too many requests" error messages
- Working initially, then failing after a few requests

**Solutions:**

1. **Wait it out:** Rate limits typically reset after 1-60 minutes
2. **Use our built-in fallback:** The system automatically uses mock data
3. **Reduce API calls:** Don't make rapid successive requests
4. **Use different networks:** Try different internet connections or VPN

**Prevention:**

- The ML API now includes automatic rate limiting
- Exponential backoff retry logic
- Automatic fallback to realistic mock data

### 2. Network Connectivity Issues

**Symptoms:**

- Timeout errors
- Connection refused
- DNS resolution failures

**Solutions:**

1. Check internet connection
2. Try different DNS servers (8.8.8.8, 1.1.1.1)
3. Disable VPN/proxy temporarily
4. Check firewall settings

### 3. Invalid Ticker Symbols

**Symptoms:**

- "No timezone found, symbol may be delisted"
- Empty data returned
- "Symbol not found" errors

**Solutions:**

1. Verify ticker symbol is correct
2. For Indian stocks, use `.NS` suffix (e.g., `RELIANCE.NS`)
3. For other markets, use appropriate suffix
4. Check if company is still publicly traded

## Testing Yahoo Finance Status

### Quick Status Check

```bash
cd ml_predictor
python -c "from stock_predictor_api import StockPredictorAPI; api = StockPredictorAPI(); print(api.get_yahoo_finance_status())"
```

### Wait and Test Tool

```bash
python wait_and_test.py
```

### Full Debug Test

```bash
python debug_yfinance.py
```

## API Endpoints for Status

### Health Check

```
GET http://localhost:5000/health
```

### Yahoo Finance Status

```
GET http://localhost:5000/status
```

Returns:

```json
{
  "yahoo_finance": {
    "status": "rate_limited|working|error|network_error",
    "message": "Description of current status"
  },
  "mock_data_available": true,
  "service": "ML Stock Predictor API"
}
```

## Current System Behavior

### ✅ What Works Well

1. **Automatic Fallback:** System uses mock data when Yahoo Finance fails
2. **Rate Limiting Protection:** Built-in delays and retry logic
3. **Clear Status Messages:** Detailed error reporting
4. **Mock Data Quality:** Realistic price movements and technical indicators
5. **Frontend Integration:** UI clearly shows when using mock data

### ⚠️ What to Expect

1. **Initial Delays:** First requests may take longer due to rate limiting
2. **Mock Data Usage:** You'll see "using mock data" messages frequently
3. **Temporary Real Data:** Occasionally real data may work between rate limits

## Production Recommendations

### For Development

- Current setup is perfect for development
- Mock data ensures consistent testing
- No API keys or paid services required

### For Production (Optional Upgrades)

1. **Paid Data Sources:**

   - Alpha Vantage API
   - IEX Cloud
   - Quandl/Nasdaq Data Link
   - Yahoo Finance Premium

2. **Caching Strategy:**

   - Cache successful Yahoo Finance calls
   - Update data less frequently (hourly vs real-time)
   - Use persistent storage for historical data

3. **Multiple Data Sources:**
   - Primary: Yahoo Finance
   - Fallback 1: Alternative API
   - Fallback 2: Mock data

## Troubleshooting Commands

### Check Python Environment

```bash
# Activate environment
.\ml_env\Scripts\activate

# Check if yfinance is installed
pip show yfinance

# Check yfinance version
python -c "import yfinance; print(yfinance.__version__)"
```

### Test Individual Components

```bash
# Test mock data generation
python -c "from mock_data_provider import MockStockDataProvider; provider = MockStockDataProvider(); data = provider.generate_mock_data('AAPL', 30); print(f'Generated {len(data)} days of mock data')"

# Test ML model loading
python -c "from stock_predictor_api import StockPredictorAPI; api = StockPredictorAPI(); api.build_and_train_model()"
```

### Network Diagnostics

```bash
# Test basic connectivity
ping google.com

# Test Yahoo Finance website
curl -I https://finance.yahoo.com

# Test specific API endpoint
curl "https://query1.finance.yahoo.com/v8/finance/chart/AAPL"
```

## Common Error Messages and Meanings

| Error Message                                      | Meaning                       | Solution                                         |
| -------------------------------------------------- | ----------------------------- | ------------------------------------------------ |
| "429 Client Error: Too Many Requests"              | Rate limited by Yahoo Finance | Wait 15-60 minutes                               |
| "No timezone found, symbol may be delisted"        | Invalid ticker or API issue   | Check ticker spelling, wait and retry            |
| "Expecting value: line 1 column 1 (char 0)"        | Empty response from API       | Usually rate limiting, system will use mock data |
| "HTTPSConnectionPool(...): Max retries exceeded"   | Network connectivity issue    | Check internet connection                        |
| "RemoteDisconnected: Remote end closed connection" | Server-side issue             | Temporary, retry later                           |

## Current Status (Based on Recent Tests)

As of the last test run, Yahoo Finance is experiencing heavy rate limiting (429 errors). This is normal and expected. The system is working correctly by:

1. ✅ Detecting rate limiting automatically
2. ✅ Falling back to mock data seamlessly
3. ✅ Providing clear status messages
4. ✅ Continuing to make predictions using ML model
5. ✅ Warning users about mock data usage

**Bottom Line:** Your ML system is robust and working as designed! The mock data ensures continuous operation regardless of Yahoo Finance availability.
