from fastapi import APIRouter
from pydantic import BaseModel
from backend.Stat_Models.ARMA_model import ARMA
import numpy as np

router = APIRouter()

class ForecastARMARequest(BaseModel):
    ticker: str
    start: str
    end: str
    steps: int = 20
    max_p: int = 5
    max_q: int = 5

@router.post("/statistical/arma")
def forecast_arma_model(request: ForecastARMARequest):
    arma = ARMA(max_p=request.max_p, max_q=request.max_q)

    # Load and process data
    log_return_series = arma.load_stock_data(request.ticker, request.start, request.end)
    arma.evaluate_orders(log_return_series)

    # Forecast future log returns
    forecast_array = arma.forecast(log_return_series, steps=request.steps)

    # Reconstruct prices
    actual_prices = np.exp(np.cumsum(log_return_series))
    forecasted_prices = arma.reconstruct_prices_from_forecast(log_return_series, forecast_array)

    return {
        "forecast": forecast_array.tolist(),
        "order": {"p": arma.best_p, "q": arma.best_q},
        "mse": arma.best_mse,
        "actual_log_returns": log_return_series.tolist(),
        "actual_prices": actual_prices.tolist(),
        "forecasted_prices": forecasted_prices.tolist()
    }
