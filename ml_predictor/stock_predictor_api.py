import pandas as pd
import numpy as np
import yfinance as yf
import datetime as dt
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential, load_model
from keras.layers import Dense, Dropout, LSTM, Bidirectional
from keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
import os
import warnings
import time
import random
import requests
from mock_data_provider import MockStockDataProvider
warnings.filterwarnings('ignore')

# Global variable to track API usage and implement simple rate limiting
_last_api_call = 0
_api_call_count = 0
_max_calls_per_minute = 5

class StockPredictorAPI:
    def __init__(self):
        self.ticker = None
        self.df = None
        self.scaler = None
        self.model = None
        self.model_path = "stock_model.h5"
        self.mock_provider = MockStockDataProvider()
        self.using_mock_data = False
    
    def _wait_for_rate_limit(self):
        """Implement simple rate limiting to avoid 429 errors"""
        global _last_api_call, _api_call_count, _max_calls_per_minute
        
        current_time = time.time()
        
        # Reset counter every minute
        if current_time - _last_api_call > 60:
            _api_call_count = 0
        
        # If we've made too many calls, wait
        if _api_call_count >= _max_calls_per_minute:
            wait_time = 60 - (current_time - _last_api_call)
            if wait_time > 0:
                print(f"Rate limiting: waiting {wait_time:.1f}s before next API call...")
                time.sleep(wait_time)
                _api_call_count = 0
        
        _last_api_call = current_time
        _api_call_count += 1
    def _test_yahoo_finance_connectivity(self):
        """Test if Yahoo Finance is accessible"""
        try:
            test_url = "https://finance.yahoo.com"
            response = requests.get(test_url, timeout=10)
            return response.status_code == 200
        except:
            return False
    
    def get_yahoo_finance_status(self):
        """Get the current status of Yahoo Finance API"""
        try:
            # Test a simple ticker request
            test_ticker = yf.Ticker("AAPL")
            
            # Try to get basic info (lighter request than historical data)
            info = test_ticker.info
            
            if info and 'symbol' in info:
                return {
                    "status": "working",
                    "message": "Yahoo Finance API is accessible"
                }
            else:
                return {
                    "status": "limited", 
                    "message": "Yahoo Finance API has limited functionality"
                }
                
        except Exception as e:
            error_str = str(e).lower()
            if any(term in error_str for term in ["429", "too many requests", "rate limit"]):
                return {
                    "status": "rate_limited",
                    "message": "Yahoo Finance API is rate limited (429 error)"
                }
            elif any(term in error_str for term in ["timeout", "connection", "network"]):
                return {
                    "status": "network_error",
                    "message": "Network connectivity issues with Yahoo Finance"
                }
            else:
                return {
                    "status": "error",
                    "message": f"Yahoo Finance API error: {e}"
                }
    def fetch_data(self, ticker, days_back=365):
        """Fetch historical data for the given ticker with robust retry logic"""
        # First check connectivity
        if not self._test_yahoo_finance_connectivity():
            print("⚠ Yahoo Finance seems unreachable. Using mock data...")
            self.df = self.mock_provider.generate_mock_data(ticker, days_back)
            self.using_mock_data = True
            return self.df
        
        # Wait for rate limiting
        self._wait_for_rate_limit()
        
        end_date = dt.datetime.now()
        start_date = end_date - dt.timedelta(days=days_back)
        
        self.ticker = ticker.upper()
        self.using_mock_data = False
        
        max_retries = 4  # Increased retries for rate limiting
        base_delay = 2  # Base delay in seconds
        
        for attempt in range(max_retries):
            try:
                # Progressive delay for rate limiting
                if attempt > 0:
                    # Exponential backoff with jitter
                    delay = base_delay * (2 ** attempt) + random.uniform(0, 2)
                    print(f"Yahoo Finance rate limited. Waiting {delay:.1f}s before retry {attempt + 1}/{max_retries}...")
                    time.sleep(delay)
                
                print(f"Attempting to fetch data for {self.ticker} (attempt {attempt + 1}/{max_retries})...")
                
                # Try to download data with more conservative settings
                self.df = yf.download(
                    self.ticker, 
                    start=start_date, 
                    end=end_date, 
                    progress=False,
                    prepost=False,
                    auto_adjust=True,
                    keepna=False,
                    threads=False,  # Single-threaded to be more conservative
                    timeout=30      # Add timeout
                )
                
                # Check if we got meaningful data
                if not self.df.empty and len(self.df) > 10:  # Need at least 10 days
                    print(f"✓ Successfully fetched real data for {self.ticker}: {len(self.df)} days")
                    print(f"  Date range: {self.df.index[0].date()} to {self.df.index[-1].date()}")
                    print(f"  Latest price: ${self.df['Close'].iloc[-1]:.2f}")
                    return self.df
                elif not self.df.empty:
                    print(f"⚠ Got data but insufficient ({len(self.df)} days). Retrying...")
                else:
                    print(f"⚠ No data returned. Retrying...")
                    
            except Exception as e:
                error_str = str(e).lower()
                print(f"Yahoo Finance error (attempt {attempt + 1}/{max_retries}): {e}")
                
                # Check for specific error types
                if any(term in error_str for term in ["429", "too many requests", "rate limit"]):
                    print("  → Rate limiting detected")
                    if attempt < max_retries - 1:
                        continue
                elif any(term in error_str for term in ["timeout", "connection", "network"]):
                    print("  → Network issue detected")
                    if attempt < max_retries - 1:
                        continue
                else:
                    print(f"  → Other error: {e}")
                    # For other errors, still try to retry but with shorter delay
                    if attempt < max_retries - 1:
                        time.sleep(1)
                        continue
        
        # Fallback to mock data if all retries failed
        print(f"\n⚠ Yahoo Finance failed after {max_retries} attempts. Using mock data for {ticker}...")
        print("  This might be due to:")
        print("  - Rate limiting (too many requests)")
        print("  - Network connectivity issues")
        print("  - Yahoo Finance API maintenance")
        print("  - Invalid ticker symbol")
        
        self.df = self.mock_provider.generate_mock_data(ticker, days_back)
        self.using_mock_data = True
        
        return self.df
    
    def add_technical_indicators(self):
        """Add technical indicators to the dataframe"""
        # Moving Averages
        self.df['MA_10'] = self.df['Close'].rolling(window=10).mean()
        self.df['MA_20'] = self.df['Close'].rolling(window=20).mean()
        self.df['MA_50'] = self.df['Close'].rolling(window=50).mean()
        
        # RSI
        delta = self.df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        self.df['RSI'] = 100 - (100 / (1 + rs))
        
        # MACD
        exp12 = self.df['Close'].ewm(span=12, adjust=False).mean()
        exp26 = self.df['Close'].ewm(span=26, adjust=False).mean()
        self.df['MACD'] = exp12 - exp26
        
        # Fill any NaN values
        self.df.ffill(inplace=True)
        
        return self.df
    
    def prepare_data_for_prediction(self, look_back=60):
        """Prepare data for prediction"""
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = self.scaler.fit_transform(self.df[['Close']].values)
        
        # Get the last sequence for prediction
        if len(scaled_data) < look_back:
            raise ValueError(f"Not enough data. Need at least {look_back} days.")
            
        last_sequence = scaled_data[-look_back:]
        return last_sequence.reshape(1, look_back, 1)
    
    def build_and_train_model(self, look_back=60):
        """Build and train the model if it doesn't exist"""
        if os.path.exists(self.model_path):
            print("Loading existing model...")
            self.model = load_model(self.model_path)
            return
            
        print("Training new model...")
        
        # Prepare training data
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = self.scaler.fit_transform(self.df[['Close']].values)
        
        X, y = [], []
        for i in range(look_back, len(scaled_data)):
            X.append(scaled_data[i-look_back:i, 0])
            y.append(scaled_data[i, 0])
            
        X, y = np.array(X), np.array(y)
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))
        
        # Build model
        model = Sequential()
        model.add(Bidirectional(LSTM(50, return_sequences=True), input_shape=(look_back, 1)))
        model.add(Dropout(0.2))
        model.add(Bidirectional(LSTM(50)))
        model.add(Dropout(0.2))
        model.add(Dense(25, activation='relu'))
        model.add(Dense(1))
        
        model.compile(optimizer='adam', loss='mean_squared_error')
          # Train model with validation split for better monitoring
        if len(X) > 100:  # Only use validation split if we have enough data
            validation_split = 0.2
        else:
            validation_split = 0.0
            
        callbacks = [
            EarlyStopping(monitor='loss', patience=10, restore_best_weights=True)
        ]
        
        # Only add ModelCheckpoint if we have validation data
        if validation_split > 0:
            callbacks.append(ModelCheckpoint(self.model_path, save_best_only=True, monitor='val_loss'))
        else:
            callbacks.append(ModelCheckpoint(self.model_path, save_best_only=True, monitor='loss'))
        
        model.fit(X, y, epochs=30, batch_size=16, 
                 validation_split=validation_split,
                 callbacks=callbacks, verbose=0)
        self.model = model
        
        print("Model training completed and saved.")
    
    def predict_next_day(self, ticker):
        """Predict next day price for given ticker"""
        try:
            # Fetch data
            self.fetch_data(ticker)
            self.add_technical_indicators()
            
            # Prepare data
            X_pred = self.prepare_data_for_prediction()
            
            # Load or train model
            self.build_and_train_model()
              # Make prediction
            prediction_scaled = self.model.predict(X_pred, verbose=0)
            prediction = float(self.scaler.inverse_transform(prediction_scaled)[0, 0])
            
            # Get current price
            current_price = float(self.df['Close'].iloc[-1])
            
            # Calculate change
            price_change = float(prediction - current_price)
            percent_change = float((price_change / current_price) * 100)
            
            # Generate explanation based on technical indicators
            explanation = self._generate_explanation(current_price, prediction)
            return {
                "success": True,
                "ticker": str(ticker.upper()),
                "current_price": float(round(current_price, 2)),
                "predicted_price": float(round(prediction, 2)),
                "price_change": float(round(price_change, 2)),
                "percent_change": float(round(percent_change, 2)),
                "explanation": str(explanation),
                "prediction_date": str((dt.datetime.now() + dt.timedelta(days=1)).strftime("%Y-%m-%d")),                "using_mock_data": bool(self.using_mock_data)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "ticker": str(ticker.upper())
            }
    
    def _generate_explanation(self, current_price, predicted_price):
        """Generate explanation based on technical indicators and prediction"""
        change_percent = float(((predicted_price - current_price) / current_price) * 100)
        
        # Get latest technical indicators (convert to Python native types)
        latest_rsi = float(self.df['RSI'].iloc[-1]) if not pd.isna(self.df['RSI'].iloc[-1]) else 50.0
        latest_macd = float(self.df['MACD'].iloc[-1]) if not pd.isna(self.df['MACD'].iloc[-1]) else 0.0
        
        trend_direction = "bullish" if change_percent > 0 else "bearish"
        confidence = float(min(abs(change_percent) * 10, 85))  # Cap confidence at 85%
        
        rsi_signal = ""
        if latest_rsi > 70:
            rsi_signal = "RSI indicates overbought conditions. "
        elif latest_rsi < 30:
            rsi_signal = "RSI indicates oversold conditions. "
        
        macd_signal = ""
        if latest_macd > 0:
            macd_signal = "MACD shows positive momentum. "
        else:
            macd_signal = "MACD shows negative momentum. "
        
        explanation = f"Based on LSTM analysis of historical price patterns and technical indicators, "
        explanation += f"the model predicts a {trend_direction} movement of {abs(change_percent):.2f}%. "
        explanation += f"{rsi_signal}{macd_signal}"
        explanation += f"Model confidence: {confidence:.1f}%. "
        
        if self.using_mock_data:
            explanation += "[Note: Using simulated data due to Yahoo Finance rate limiting]"
        
        return explanation

# Simple CLI interface for testing
if __name__ == "__main__":
    predictor = StockPredictorAPI()
    
    # Example usage
    ticker = input("Enter ticker symbol (e.g., AAPL, RELIANCE.NS): ").strip()
    result = predictor.predict_next_day(ticker)
    
    if result["success"]:
        print(f"\n=== Prediction for {result['ticker']} ===")
        print(f"Current Price: ${result['current_price']}")
        print(f"Predicted Price: ${result['predicted_price']}")
        print(f"Expected Change: ${result['price_change']} ({result['percent_change']:+.2f}%)")
        print(f"Prediction Date: {result['prediction_date']}")
        if result.get('using_mock_data'):
            print("⚠️  Using mock data due to Yahoo Finance issues")
        print(f"\nExplanation: {result['explanation']}")
    else:
        print(f"Error: {result['error']}")
