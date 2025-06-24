from fastapi import APIRouter
from finacial_analysis import Financial_Analysis  # adjust import if needed

router = APIRouter(prefix="/api/finance", tags=["finance"])

@router.get("/{ticker}")
def run_financial_analysis(ticker: str):
    try:
        analysis = Financial_Analysis(ticker)
        return {
            "Valuation": analysis.Valuation_Analysis(),
            "Profitability": analysis.Profitability_Analysis(),
            "Liquidity": analysis.Liquidity_Analysis(),
            "Solvency": analysis.Solvency_Analysis(),
            "Efficiency": analysis.Efficiency_Analysis(),
            "CashFlow": analysis.Cash_Flow_Analysis(),
            "FinalScore": analysis.Final_Score(),
            "InvestmentRating": analysis.Investment_Rating()
        }
    except Exception as e:
        return {"error": str(e)}
