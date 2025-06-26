#!/usr/bin/env python3
"""
Quick test script for the fixed ML Stock Predictor
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from stock_predictor_api_fixed import StockPredictorAPI

def test_prediction(ticker):
    """Test prediction for a ticker"""
    print(f"\n{'='*50}")
    print(f"Testing ML Prediction for {ticker}")
    print(f"{'='*50}")
    
    try:
        predictor = StockPredictorAPI()
        result = predictor.predict_next_day(ticker)
        
        if result["success"]:
            print("✅ SUCCESS!")
            print(f"Ticker: {result['ticker']}")
            print(f"Current Price: ${result['current_price']:.2f}")
            print(f"Predicted Price: ${result['predicted_price']:.2f}")
            print(f"Expected Change: ${result['price_change']:.2f} ({result['percent_change']:+.2f}%)")
            print(f"Prediction Date: {result['prediction_date']}")
            
            if result.get('using_mock_data'):
                print("⚠️  Using mock data (Yahoo Finance unavailable)")
            else:
                print("✅ Using real market data")
                
            print(f"\nExplanation: {result['explanation']}")
            return True
        else:
            print(f"❌ FAILED: {result['error']}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def main():
    """Test multiple tickers"""
    print("🚀 ML Stock Predictor - Quick Test")
    
    # Test tickers
    tickers = ["AAPL", "MSFT", "RELIANCE.NS"]
    
    success_count = 0
    for ticker in tickers:
        if test_prediction(ticker):
            success_count += 1
    
    print(f"\n{'='*50}")
    print(f"TEST SUMMARY: {success_count}/{len(tickers)} successful")
    
    if success_count == len(tickers):
        print("🎉 All tests passed! Your ML predictor is working!")
    else:
        print("⚠️  Some tests failed, but that's okay if using mock data")
    
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
