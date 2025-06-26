import pandas as pd
import numpy as np
import datetime as dt
import random

class MockStockDataProvider:
    """Provides mock stock data when Yahoo Finance is unavailable"""
    def __init__(self):
        self.mock_stocks = {
            'AAPL': {'name': 'Apple Inc.', 'base_price': 150.0, 'volatility': 0.02},
            'MSFT': {'name': 'Microsoft Corp.', 'base_price': 330.0, 'volatility': 0.015},
            'GOOGL': {'name': 'Alphabet Inc.', 'base_price': 140.0, 'volatility': 0.025},
            'TSLA': {'name': 'Tesla Inc.', 'base_price': 250.0, 'volatility': 0.03},
            'RELIANCE.NS': {'name': 'Reliance Industries Ltd.', 'base_price': 2500.0, 'volatility': 0.02},
            'TCS.NS': {'name': 'Tata Consultancy Services Ltd.', 'base_price': 3800.0, 'volatility': 0.018},
            'INFY.NS': {'name': 'Infosys Ltd.', 'base_price': 1450.0, 'volatility': 0.022},
        }
    
    def generate_mock_data(self, ticker, days_back=365):
        """Generate realistic mock stock data"""
        ticker = ticker.upper()
        
        if ticker not in self.mock_stocks:
            # Generate mock data for unknown ticker
            stock_info = {
                'name': f'{ticker} Corp.',
                'base_price': random.uniform(50, 500),
                'volatility': random.uniform(0.01, 0.04)
            }
        else:
            stock_info = self.mock_stocks[ticker]
        
        # Generate dates
        end_date = dt.datetime.now()
        start_date = end_date - dt.timedelta(days=days_back)
        dates = pd.date_range(start=start_date, end=end_date, freq='D')
        
        # Remove weekends (approximate)
        business_dates = [d for d in dates if d.weekday() < 5]
          # Generate price data with realistic movements
        prices = []
        current_price = stock_info['base_price']
        
        for i, date in enumerate(business_dates):
            # Add some trend and seasonality (more controlled)
            trend_factor = 1 + (i / len(business_dates)) * 0.02  # Small upward trend
            seasonal_factor = 1 + 0.01 * np.sin(2 * np.pi * i / 252)  # Small seasonality
            
            # Random walk with controlled drift
            daily_change = np.random.normal(0.0005, stock_info['volatility'])  # Smaller drift
            current_price *= (1 + daily_change) * trend_factor * seasonal_factor
            
            # Keep price within reasonable bounds
            min_price = stock_info['base_price'] * 0.5
            max_price = stock_info['base_price'] * 2.0
            current_price = max(min_price, min(max_price, current_price))
            
            prices.append(current_price)
        
        # Create OHLC data
        data = []
        for i, (date, close) in enumerate(zip(business_dates, prices)):
            # Generate realistic OHLC from close price
            volatility = stock_info['volatility']
            
            # Open is close of previous day with small gap
            if i == 0:
                open_price = close * (1 + np.random.normal(0, volatility * 0.5))
            else:
                open_price = prices[i-1] * (1 + np.random.normal(0, volatility * 0.5))
            
            # High and low based on intraday volatility
            intraday_range = close * volatility * np.random.uniform(0.5, 2.0)
            high = max(open_price, close) + intraday_range * 0.5
            low = min(open_price, close) - intraday_range * 0.5
            
            # Volume (random but realistic)
            avg_volume = random.randint(10000000, 100000000)
            volume = int(avg_volume * np.random.lognormal(0, 0.5))
            
            data.append({
                'Date': date,
                'Open': open_price,
                'High': high,
                'Low': low,
                'Close': close,
                'Volume': volume
            })
        
        # Create DataFrame
        df = pd.DataFrame(data)
        df.set_index('Date', inplace=True)
        
        return df

# Test the mock data provider
if __name__ == "__main__":
    provider = MockStockDataProvider()
    
    print("Generating mock data for AAPL...")
    mock_data = provider.generate_mock_data('AAPL', days_back=30)
    
    print(f"Generated {len(mock_data)} days of data")
    print("\nLast 5 days:")
    print(mock_data.tail())
    
    print(f"\nLatest close price: ${mock_data['Close'].iloc[-1]:.2f}")
    print(f"30-day return: {((mock_data['Close'].iloc[-1] / mock_data['Close'].iloc[0]) - 1) * 100:.2f}%")
