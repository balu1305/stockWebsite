# ML Stock Predictor Integration Guide

## Overview

Your stock trading application now supports machine learning-based predictions using your custom LSTM neural network instead of Gemini. This guide explains how to set up and use the ML predictor.

## What Was Changed

### 1. New ML Components Added

- `ml_predictor/stock_predictor_api.py` - Simplified ML predictor API class
- `ml_predictor/api_server.py` - Flask API server
- `ml_predictor/requirements.txt` - Python dependencies
- `ml_predictor/setup.bat` & `ml_predictor/setup.sh` - Setup scripts
- `ml_predictor/test_api.py` - API testing script

### 2. Updated Frontend Components

- `src/services/ml-prediction.ts` - ML prediction service
- `src/ai/flows/predict-stock-price-ml.ts` - ML-based prediction flow
- `src/app/(app)/predictions/page.tsx` - Updated to use ML predictions
- `.env.local` - Added ML API URL configuration

### 3. Original Files Preserved

- Your original Gemini-based prediction flow is still available
- All existing functionality remains intact

## Setup Instructions

### Step 1: Set Up Python Environment

Navigate to the ML predictor directory:

```bash
cd ml_predictor
```

**For Windows:**

```bash
setup.bat
```

**For Linux/Mac:**

```bash
chmod +x setup.sh
./setup.sh
```

### Step 2: Start the ML API Server

Activate the Python environment:

```bash
# Windows
ml_env\Scripts\activate

# Linux/Mac
source ml_env/bin/activate
```

Start the API server:

```bash
python api_server.py
```

You should see:

```
Starting ML Stock Predictor API Server...
Available endpoints:
  GET  /health
  POST /predict
  GET  /predict/<ticker>
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
```

### Step 3: Test the ML API

In a new terminal, test the API:

```bash
cd ml_predictor
python test_api.py
```

### Step 4: Start Your Next.js Application

In another terminal, start your Next.js app:

```bash
cd ..  # Go back to the main project directory
npm run dev
```

### Step 5: Test the Integration

1. Open your browser to `http://localhost:3000`
2. Navigate to the Predictions page
3. Enter a stock ticker (e.g., "AAPL", "MSFT", "RELIANCE.NS")
4. Click "Get ML Prediction"

## How It Works

### Data Flow

```
Frontend (Next.js)
    ↓
ML Prediction Service
    ↓
Flask API Server
    ↓
LSTM Model
    ↓
Yahoo Finance API
```

### Model Training Process

1. **Data Fetching**: Downloads 1 year of historical stock data from Yahoo Finance
2. **Technical Indicators**: Calculates RSI, MACD, and moving averages
3. **Data Preprocessing**: Normalizes data using MinMaxScaler
4. **Model Training**: Trains Bidirectional LSTM with 60-day lookback
5. **Model Persistence**: Saves trained model for future use
6. **Prediction**: Uses trained model to predict next day's price

### Features

- **Automatic Model Training**: Models are trained on first use and cached
- **Technical Analysis**: Incorporates multiple technical indicators
- **Real-time Data**: Fetches live stock data for predictions
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance Optimization**: Model caching for faster subsequent predictions

## Switching Between Gemini and ML

### Currently Active: ML Predictions

The predictions page now uses your LSTM model by default.

### To Switch Back to Gemini

If you want to use Gemini predictions, update the import in `src/app/(app)/predictions/page.tsx`:

```typescript
// Change this line:
import {
  predictStockPriceML,
  type PredictStockPriceOutput,
} from "@/ai/flows/predict-stock-price-ml";

// To this:
import {
  predictStockPrice,
  type PredictStockPriceOutput,
} from "@/ai/flows/predict-stock-price";

// And change the function call:
const result = await predictStockPrice({ ticker: values.ticker.toUpperCase() });
```

### To Use Both (Optional)

You could create a toggle in the UI to switch between ML and Gemini predictions.

## Troubleshooting

### Common Issues

#### 1. "ML prediction service is not available"

**Solution**: Make sure the Python API server is running on port 5000

```bash
cd ml_predictor
ml_env\Scripts\activate  # Windows
python api_server.py
```

#### 2. "No data found for ticker"

**Solution**:

- Check your internet connection
- Verify the ticker symbol format (e.g., "AAPL" for US stocks, "RELIANCE.NS" for Indian stocks)
- Try a different ticker symbol

#### 3. Python Module Import Errors

**Solution**: Ensure virtual environment is activated and dependencies are installed

```bash
cd ml_predictor
ml_env\Scripts\activate
pip install -r requirements.txt
```

#### 4. "Not enough data. Need at least 60 days."

**Solution**: Use stocks with sufficient trading history (most major stocks work fine)

### Performance Notes

- **First Prediction**: Takes longer as the model needs to be trained (30-60 seconds)
- **Subsequent Predictions**: Much faster as the model is cached (~2-5 seconds)
- **Memory Usage**: Models are cached in memory for better performance
- **Model Accuracy**: Depends on data quality and market conditions

## Customization Options

### Model Parameters

Edit `stock_predictor_api.py` to customize:

- `look_back=60` - Number of days to look back
- LSTM layer sizes and dropout rates
- Technical indicators used
- Training epochs and batch size

### API Configuration

Edit `api_server.py` to customize:

- Server port (default: 5000)
- CORS settings
- API endpoints
- Error handling

### Frontend Integration

Edit `ml-prediction.ts` to customize:

- API timeouts
- Error messages
- Response handling
- Fallback behavior

## Production Deployment

### For Production Use:

1. **Use a production WSGI server** (e.g., Gunicorn) instead of Flask dev server
2. **Set up proper logging** and monitoring
3. **Add authentication** if needed
4. **Use environment variables** for configuration
5. **Consider model versioning** and periodic retraining
6. **Set up health checks** and monitoring

### Example Production Setup:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 api_server:app
```

## Next Steps

1. **Monitor Performance**: Track prediction accuracy over time
2. **Enhance Model**: Add more technical indicators or features
3. **Improve UI**: Add confidence indicators, charts, or historical accuracy
4. **Scale**: Consider using a more robust ML platform for production
5. **A/B Testing**: Compare ML vs Gemini predictions to see which performs better

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the console logs in both the Python API and Next.js app
3. Test the API directly using the test script or curl commands
4. Ensure all dependencies are properly installed

Your ML-based stock predictor is now ready to use! 🚀
