from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from typing import Literal
import os
import logging
from backend.utils.ohlc_utils import fetch_ohlc_alphavantage

router = APIRouter()

API_KEY = os.getenv("ALPHAVANTAGE_API_KEY", "PE6B3MEJUZYOVPE5")

@router.get("/ohlc", tags=["OHLC"])
def get_ohlc_data(
    ticker: str = Query(..., description="Stock ticker symbol"),
    interval: Literal["1min", "5min", "15min", "30min", "60min", "1d", "1wk", "1mo"] = "1d"
):
    try:
        if interval in ["1min", "5min", "15min", "30min", "60min"]:
            function = "TIME_SERIES_INTRADAY"
        elif interval == "1d":
            function = "TIME_SERIES_DAILY"
        elif interval == "1wk":
            function = "TIME_SERIES_WEEKLY"
        elif interval == "1mo":
            function = "TIME_SERIES_MONTHLY"
        else:
            raise ValueError("Unsupported interval.")

        logging.info(f"Fetching OHLC for {ticker} at interval {interval} using {function}")
        ohlc_data = fetch_ohlc_alphavantage(
            ticker, interval=interval, function=function, apikey=API_KEY
        )

        if not isinstance(ohlc_data, list):
            logging.error("Alpha Vantage returned non-list data")
            raise HTTPException(status_code=400, detail="Unexpected data format from Alpha Vantage.")

        return JSONResponse(content=ohlc_data)

    except Exception as e:
        logging.exception("Error fetching OHLC data")
        raise HTTPException(status_code=400, detail=str(e))
