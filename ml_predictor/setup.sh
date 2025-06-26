#!/bin/bash

# Setup script for ML Stock Predictor

echo "Setting up ML Stock Predictor environment..."

# Create virtual environment
python -m venv ml_env

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source ml_env/Scripts/activate
else
    # Linux/Mac
    source ml_env/bin/activate
fi

# Upgrade pip
python -m pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

echo "Setup complete!"
echo ""
echo "To activate the environment:"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "  source ml_env/Scripts/activate"
else
    echo "  source ml_env/bin/activate"
fi
echo ""
echo "To start the API server:"
echo "  python api_server.py"
echo ""
echo "To test the API:"
echo "  curl -X POST http://localhost:5000/predict -H 'Content-Type: application/json' -d '{\"ticker\": \"AAPL\"}'"
