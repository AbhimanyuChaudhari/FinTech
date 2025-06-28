from fastapi import APIRouter
from backend.Stat_Models.moving_average_model import MAModel  # path to your MAModel
from pydantic import BaseModel
import numpy as np

router = APIRouter()

class ForecastMARequest(BaseModel):
    ticker: str
    start: str
    end: str
    steps: int = 20
    max_q: int = 10

@router.post("/statistical/ma")
def forecast_ma_model(request: ForecastMARequest):
    ma = MAModel(max_q=request.max_q)

    # Load and process data
    log_return_series = ma.load_stock_data(request.ticker, request.start, request.end)
    ma.evaluate_orders(log_return_series)

    # Forecast log returns
    forecast_array = ma.forecast(log_return_series, steps=request.steps)

    # Reconstruct prices from log returns
    actual_prices = np.exp(np.cumsum(log_return_series))
    forecasted_prices = ma.reconstruct_prices_from_forecast(log_return_series, forecast_array)

    return {
        "forecast": forecast_array.tolist(),
        "order": ma.best_q,
        "mse": ma.best_mse,
        "actual_log_returns": log_return_series.tolist(),
        "actual_prices": actual_prices.tolist(),
        "forecasted_prices": forecasted_prices.tolist()
    }
