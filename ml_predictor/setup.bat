@echo off
echo Setting up ML Stock Predictor environment...

REM Create virtual environment
python -m venv ml_env

REM Activate virtual environment
call ml_env\Scripts\activate.bat

REM Upgrade pip
python -m pip install --upgrade pip

REM Install requirements
pip install -r requirements.txt

echo Setup complete!
echo.
echo To activate the environment:
echo   ml_env\Scripts\activate.bat
echo.
echo To start the API server:
echo   python api_server.py
echo.
echo To test the API:
echo   curl -X POST http://localhost:5000/predict -H "Content-Type: application/json" -d "{\"ticker\": \"AAPL\"}"

pause
