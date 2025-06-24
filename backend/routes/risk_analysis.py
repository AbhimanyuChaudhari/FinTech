from fastapi import APIRouter, Query
from risk_analysis import RiskAnalysis

router = APIRouter(prefix="/api/risk", tags=["Risk Analysis"])

@router.get("/{ticker}")
def run_risk_analysis(
    ticker: str,
    risk_profile: str = Query("moderate", enum=["conservative", "moderate", "aggressive"]),
    capital: float = Query(10000),
    timeframe: str = Query("1hour", enum=["1min", "5min", "15min", "30min", "1hour", "1day"])
):
    try:
        analysis = RiskAnalysis(ticker, timeframe=timeframe)
        result = analysis.run_risk_analysis(risk_profile, capital)
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}
