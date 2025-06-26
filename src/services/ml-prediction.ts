/**
 * ML-based stock prediction service
 * This service calls our Python ML API instead of using Gemini
 */

export interface MLPredictionResult {
  success: boolean;
  ticker: string;
  current_price?: number;
  predicted_price?: number;
  price_change?: number;
  percent_change?: number;
  explanation?: string;
  prediction_date?: string;
  using_mock_data?: boolean;
  error?: string;
}

export interface MLPredictionInput {
  ticker: string;
}

export interface MLPredictionOutput {
  predictedPrice: number;
  explanation: string;
}

class MLStockPredictionService {
  private baseUrl: string;

  constructor() {
    // Use environment variable or default to localhost
    this.baseUrl = process.env.ML_API_URL || 'http://localhost:5000';
  }

  async predictStockPrice(input: MLPredictionInput): Promise<MLPredictionOutput> {
    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: input.ticker
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: MLPredictionResult = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Prediction failed');
      }

      return {
        predictedPrice: result.predicted_price!,
        explanation: result.explanation!
      };

    } catch (error) {
      console.error('ML Prediction Error:', error);
      
      // Fallback error handling
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
          throw new Error('ML prediction service is not available. Please ensure the Python API server is running on port 5000.');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred during prediction');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const mlStockPredictionService = new MLStockPredictionService();
