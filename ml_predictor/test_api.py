#!/usr/bin/env python3
"""
Test script for ML Stock Predictor API
"""

import sys
import time
import requests
import json

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get("http://localhost:5000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_prediction(ticker="AAPL"):
    """Test stock prediction endpoint"""
    print(f"\nTesting prediction for {ticker}...")
    try:
        # Test POST method
        response = requests.post(
            "http://localhost:5000/predict",
            json={"ticker": ticker},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ Prediction successful")
                print(f"   Ticker: {result['ticker']}")
                print(f"   Current Price: ${result['current_price']:.2f}")
                print(f"   Predicted Price: ${result['predicted_price']:.2f}")
                print(f"   Change: {result['percent_change']:+.2f}%")
                print(f"   Explanation: {result['explanation'][:100]}...")
                return True
            else:
                print(f"❌ Prediction failed: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Prediction failed: HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Prediction failed: {e}")
        return False

def test_get_prediction(ticker="MSFT"):
    """Test GET method prediction endpoint"""
    print(f"\nTesting GET prediction for {ticker}...")
    try:
        response = requests.get(f"http://localhost:5000/predict/{ticker}", timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ GET prediction successful")
                print(f"   Ticker: {result['ticker']}")
                print(f"   Current Price: ${result['current_price']:.2f}")
                print(f"   Predicted Price: ${result['predicted_price']:.2f}")
                return True
            else:
                print(f"❌ GET prediction failed: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ GET prediction failed: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ GET prediction failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("ML STOCK PREDICTOR API TEST")
    print("=" * 60)
    
    # Check if server is running
    if not test_health_check():
        print("\n❌ API server is not running!")
        print("Please start the server with: python api_server.py")
        sys.exit(1)
    
    # Test predictions
    success_count = 0
    total_tests = 3
    
    if test_prediction("AAPL"):
        success_count += 1
    
    if test_get_prediction("MSFT"):
        success_count += 1
        
    if test_prediction("GOOGL"):
        success_count += 1
    
    print("\n" + "=" * 60)
    print(f"TEST RESULTS: {success_count}/{total_tests} tests passed")
    
    if success_count == total_tests:
        print("🎉 All tests passed! ML API is working correctly.")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Check the API server logs.")
        sys.exit(1)

if __name__ == "__main__":
    main()
