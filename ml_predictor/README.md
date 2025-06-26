# ML Stock Predictor

This directory contains the machine learning components for stock price prediction using LSTM neural networks.

## Features

- **LSTM Neural Network**: Uses Bidirectional LSTM layers for time series prediction
- **Technical Indicators**: Incorporates RSI, MACD, and Moving Averages
- **REST API**: Flask-based API for integration with the Next.js frontend
- **Real-time Data**: Fetches live stock data from Yahoo Finance

## Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Quick Start

1. **For Windows:**

   ```bash
   setup.bat
   ```

2. **For Linux/Mac:**

   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Manual Setup:**

   ```bash
   # Create virtual environment
   python -m venv ml_env

   # Activate virtual environment
   # Windows:
   ml_env\Scripts\activate
   # Linux/Mac:
   source ml_env/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

### Running the API Server

1. Activate the virtual environment:

   ```bash
   # Windows:
   ml_env\Scripts\activate
   # Linux/Mac:
   source ml_env/bin/activate
   ```

2. Start the API server:

   ```bash
   python api_server.py
   ```

3. The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check

```
GET /health
```

### Predict Stock Price

```
POST /predict
Content-Type: application/json

{
  "ticker": "AAPL"
}
```

Or using GET:

```
GET /predict/AAPL
```

### Response Format

```json
{
  "success": true,
  "ticker": "AAPL",
  "current_price": 150.25,
  "predicted_price": 152.3,
  "price_change": 2.05,
  "percent_change": 1.36,
  "explanation": "Based on LSTM analysis...",
  "prediction_date": "2024-01-15"
}
```

## Usage Examples

### Testing the API

```bash
# Using curl
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"ticker": "AAPL"}'

# Or using GET
curl http://localhost:5000/predict/AAPL
```

### Using in Python

```python
from stock_predictor_api import StockPredictorAPI

predictor = StockPredictorAPI()
result = predictor.predict_next_day("AAPL")
print(result)
```

## Model Details

- **Architecture**: Bidirectional LSTM with dropout layers
- **Input Features**: Historical close prices with 60-day lookback
- **Technical Indicators**: RSI, MACD, Moving Averages (10, 20, 50 day)
- **Training**: Uses early stopping and model checkpointing
- **Data Source**: Yahoo Finance API

## Configuration

### Environment Variables

Add these to your `.env` file in the Next.js project:

```env
ML_API_URL=http://localhost:5000
```

### Model Persistence

The trained model is automatically saved as `stock_model.h5` and reused for subsequent predictions to improve performance.

## Integration with Next.js

The ML predictor integrates with your trading application through:

1. **ML Prediction Service** (`src/services/ml-prediction.ts`)
2. **ML Flow** (`src/ai/flows/predict-stock-price-ml.ts`)
3. **Updated Predictions Page** (`src/app/(app)/predictions/page.tsx`)

## Troubleshooting

### Common Issues

1. **API Server Not Running**

   - Error: "ML prediction service is not available"
   - Solution: Start the Python API server using `python api_server.py`

2. **Module Import Errors**

   - Solution: Ensure virtual environment is activated and dependencies are installed

3. **Insufficient Training Data**

   - Error: "Not enough data. Need at least 60 days."
   - Solution: Use stocks with sufficient historical data

4. **Network Connectivity**
   - Error: "No data found for ticker"
   - Solution: Check internet connection and verify ticker symbol

### Performance Tips

- The model is trained on first use for each ticker and cached
- Subsequent predictions for the same ticker are much faster
- Consider training models in advance for frequently used tickers

## Dependencies

See `requirements.txt` for full list. Key dependencies:

- **TensorFlow/Keras**: Neural network framework
- **pandas/numpy**: Data manipulation
- **yfinance**: Stock data fetching
- **scikit-learn**: Data preprocessing
- **Flask**: API server
- **matplotlib/plotly**: Visualization (for standalone use)

## License

This ML predictor is part of the stock trading application and follows the same license terms.
