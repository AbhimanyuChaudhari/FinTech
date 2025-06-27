from fastapi import APIRouter
from backend.Stat_Models.autoregressive_model import ARModel
from pydantic import BaseModel
import numpy as np

router = APIRouter()

class ForecastRequest(BaseModel):
    ticker: str
    start: str
    end: str
    steps: int = 20
    max_p: int = 50
    penalty_lambda: float = 0.01

@router.post("/statistical/ar")
def forecast_ar_model(request: ForecastRequest):
    ar = ARModel(max_p=request.max_p, penalty_lambda=request.penalty_lambda)
    
    # Load and process data
    log_return_series = ar.load_stock_data(request.ticker, request.start, request.end)
    ar.evaluate_orders(log_return_series)
    
    # Forecast with confidence intervals
    forecast_array, ci_upper, ci_lower = ar.forecast(log_return_series, steps=request.steps)

    # Reconstruct prices
    actual_prices = np.exp(np.cumsum(log_return_series))
    forecasted_prices = ar.reconstruct_prices_from_forecast(log_return_series, forecast_array)

    return {
        "forecast": forecast_array.tolist(),
        "ci_upper": ci_upper.tolist(),
        "ci_lower": ci_lower.tolist(),
        "order": ar.best_p,
        "mse": ar.best_mse,
        "actual_log_returns": log_return_series.tolist(),
        "actual_prices": actual_prices.tolist(),
        "forecasted_prices": forecasted_prices.tolist()
    }
