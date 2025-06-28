from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
from backend.Stat_Models.SARIMA_Model import SARIMA  # Adjust path if needed

router = APIRouter()

class SarimaRequest(BaseModel):
    ticker: str
    start: str
    end: str
    steps: int = 20
    d: int = 1
    D: int = 1
    s: int = 12
    max_p: int = 3
    max_q: int = 0
    max_P: int = 2
    max_Q: int = 0

@router.post("/statistical/sarima")
def run_sarima_forecast(request: SarimaRequest):
    try:
        model = SARIMA(
            d=request.d,
            D=request.D,
            s=request.s,
            max_p=request.max_p,
            max_q=request.max_q,
            max_P=request.max_P,
            max_Q=request.max_Q,
        )

        log_returns = model.load_stock_data(
            ticker=request.ticker,
            start=request.start,
            end=request.end,
        )

        model.evaluate_orders(log_returns)
        forecast = model.forecast(steps=request.steps)
        forecasted_prices = model.reconstruct_prices(log_returns, forecast)

        return {
            "forecast": forecast.tolist(),
            "forecasted_prices": forecasted_prices.tolist(),
            "order": [model.best_p, model.best_q],
            "seasonal_order": [model.best_P, model.best_Q],
            "mse": model.best_mse,
            "mae": model.best_mae,
            "actual_log_returns": log_returns.tolist(),
        }


    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
