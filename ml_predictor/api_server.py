from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from stock_predictor_api import StockPredictorAPI

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Initialize the predictor
predictor = StockPredictorAPI()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "ML Stock Predictor API"})

@app.route('/status', methods=['GET'])
def yahoo_finance_status():
    """Check Yahoo Finance API status"""
    try:
        status = predictor.get_yahoo_finance_status()
        return jsonify({
            "yahoo_finance": status,
            "mock_data_available": True,
            "service": "ML Stock Predictor API"
        })
    except Exception as e:
        return jsonify({
            "yahoo_finance": {
                "status": "error",
                "message": f"Error checking status: {e}"
            },
            "mock_data_available": True,
            "service": "ML Stock Predictor API"
        })

@app.route('/predict', methods=['POST'])
def predict_stock():
    """Predict stock price for next day"""
    try:
        data = request.get_json()
        
        if not data or 'ticker' not in data:
            return jsonify({
                "success": False,
                "error": "Missing 'ticker' in request body"
            }), 400
        
        ticker = data['ticker'].strip().upper()
        
        if not ticker:
            return jsonify({
                "success": False,
                "error": "Ticker symbol cannot be empty"
            }), 400
        
        # Make prediction
        result = predictor.predict_next_day(ticker)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}"
        }), 500

@app.route('/predict/<ticker>', methods=['GET'])
def predict_stock_get(ticker):
    """Predict stock price using GET method"""
    try:
        result = predictor.predict_next_day(ticker)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    print("Starting ML Stock Predictor API Server...")
    print("Available endpoints:")
    print("  GET  /health")
    print("  POST /predict")
    print("  GET  /predict/<ticker>")
    print("\nExample usage:")
    print("  curl -X POST http://localhost:5000/predict -H 'Content-Type: application/json' -d '{\"ticker\": \"AAPL\"}'")
    print("  curl http://localhost:5000/predict/AAPL")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
