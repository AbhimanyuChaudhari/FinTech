from fastapi import APIRouter
from pydantic import BaseModel
from backend.Stat_Models.ARIMA_Model import ARIMA
import numpy as np
router = APIRouter()

class ARIMARequest(BaseModel):
    ticker: str
    start: str
    end: str
    steps: int = 20
    max_p: int = 5
    max_q: int = 5
    d: int = 1

@router.post("/statistical/arima")
def forecast_arima_model(request: ARIMARequest):
    arima = ARIMA(max_p=request.max_p, max_q=request.max_q, d=request.d)

    # Load and process log return data
    log_returns = arima.load_stock_data(request.ticker, request.start, request.end)
    arima.evaluate_orders(log_returns)

    # Forecast in differenced log return space
    forecast_array = arima.forecast(steps=request.steps)

    # Reconstruct prices
    actual_prices = np.exp(np.cumsum(log_returns))
    forecasted_prices = arima.reconstruct_forecast(forecast_array)

    return {
        "forecast": forecast_array.tolist(),
        "order": {"p": arima.best_p, "d": arima.d, "q": arima.best_q},
        "mse": arima.best_mse,
        "actual_log_returns": log_returns.tolist(),
        "actual_prices": actual_prices.tolist(),
        "forecasted_prices": forecasted_prices.tolist()
    }
