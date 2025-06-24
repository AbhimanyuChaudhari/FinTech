from fastapi import APIRouter
from technical_analysis import TechnicalSignalEvaluator

router = APIRouter(prefix="/api/technical", tags=["technical"])

@router.get("/{ticker}")
def get_technical_analysis(ticker: str):
    try:
        weights = {
            'RSI': 1, 'EMA': 1, 'OBV': 1, 'ATR': 1, 'STD': 1,
            'MFI': 1, 'Aroon': 1, 'Bollinger': 1, 'MACD': 1,
            'PPO': 1, 'ADX': 1, 'Stochastic': 1, 'CCI': 1,
            'ADL': 1, 'CMF': 1
        }
        evaluator = TechnicalSignalEvaluator(ticker, weights)
        decision = evaluator.make_decision()
        return {"result": decision}
    except Exception as e:
        return {"error": str(e)}
