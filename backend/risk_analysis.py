import pandas as pd
import numpy as np
import yfinance as yf
from typing import Dict

class RiskAnalysis:
    def __init__(self, symbol: str, timeframe: str = '1hour'):
        self.symbol = symbol.upper()
        self.timeframe = timeframe
        self.interval_map = {
            '1min': '1m',
            '5min': '5m',
            '15min': '15m',
            '30min': '30m',
            '1hour': '60m',
            '1day': '1d'
        }
        self.data = self.fetch_data()

    def fetch_data(self) -> pd.DataFrame:
        interval = self.interval_map.get(self.timeframe, '60m')
        period = '60d' if interval in ['1m', '2m', '5m', '15m', '30m', '60m', '90m'] else '1y'

        df = yf.download(self.symbol, period=period, interval=interval, progress=False)
        if df.empty:
            raise ValueError(f"No data returned for {self.symbol} with interval {interval}")
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.map(lambda x: x[0])  # Flatten MultiIndex
        df = df.reset_index()
        df.rename(columns={df.columns[0]: 'date'}, inplace=True)
        return df

    def compute_returns(self) -> pd.Series:
        return self.data['Close'].pct_change().dropna()

    def calculate_volatility(self) -> float:
        returns = self.compute_returns()
        return returns.std()

    def calculate_var(self, confidence_level=0.95) -> float:
        returns = self.compute_returns()
        return np.percentile(returns, (1 - confidence_level) * 100)

    def calculate_max_drawdown(self) -> float:
        returns = self.compute_returns()
        cumulative = (1 + returns).cumprod()
        peak = cumulative.cummax()
        drawdown = (cumulative - peak) / peak
        return drawdown.min()

    def calculate_sharpe_ratio(self, risk_free_rate=0.01) -> float:
        returns = self.compute_returns()
        excess_return = returns.mean() - risk_free_rate / len(returns)
        std = returns.std()
        return excess_return / std if std != 0 else 0

    def position_sizing(self, profile: str, capital: float) -> float:
        risk_levels = {
            'conservative': 0.01,
            'moderate': 0.02,
            'aggressive': 0.05
        }
        risk_per_trade = risk_levels.get(profile.lower(), 0.02)
        volatility = self.calculate_volatility()

        if volatility == 0:
            return 0

        size = (risk_per_trade * capital) / volatility
        return round(size, 2)

    def assess_risk_profile(self, profile: str, capital: float) -> dict:
        vol = self.calculate_volatility()
        var = self.calculate_var()
        drawdown = self.calculate_max_drawdown()
        sharpe = self.calculate_sharpe_ratio()

        risk_levels = {
            'conservative': 0.01,
            'moderate': 0.02,
            'aggressive': 0.05
        }
        risk_per_trade = risk_levels.get(profile.lower(), 0.02)
        size = self.position_sizing(profile, capital)

        if profile == 'conservative':
            advice = "SAFE" if vol < 0.01 and var > -0.015 and drawdown > -0.05 else "CAUTION"
        elif profile == 'moderate':
            advice = "MODERATE" if vol < 0.02 and var > -0.025 and sharpe > 1 else "WARNING"
        elif profile == 'aggressive':
            advice = "AGGRESSIVE" if sharpe > 0.5 else "FLAT"
        else:
            advice = "Please provide a valid risk profile: conservative, moderate, or aggressive."

        return {
            "ticker": self.symbol,
            "timeframe": self.timeframe,
            "risk_profile": profile,
            "capital": capital,
            "volatility": round(vol, 5),
            "value_at_risk": round(var, 5),
            "max_drawdown": round(drawdown, 5),
            "sharpe_ratio": round(sharpe, 3),
            "advice": advice,
            "suggested_position_size": f"${size} (based on {int(risk_per_trade * 100)}% risk)"
        }

    def investment_advice(self, risk_profile: str, capital: float, risk_analysis_result: Dict[str, any]) -> str:
        advice = risk_analysis_result['advice']
        volatility = risk_analysis_result['volatility']
        max_drawdown = risk_analysis_result['max_drawdown']
        sharpe_ratio = risk_analysis_result['sharpe_ratio']
        var = risk_analysis_result['value_at_risk']
        position_size = risk_analysis_result['suggested_position_size']

        drawdown_pct = abs(max_drawdown * 100)

        if risk_profile == 'conservative':
            max_investment = capital * 0.01
            profile_advice = f"Based on your conservative profile, invest no more than ${max_investment:.2f}."
        elif risk_profile == 'moderate':
            max_investment = capital * 0.02
            profile_advice = f"For your moderate risk profile, consider investing up to ${max_investment:.2f}. Drawdown risk: {drawdown_pct:.1f}%."
        elif risk_profile == 'aggressive':
            max_investment = capital * 0.05
            profile_advice = f"As an aggressive investor, up to ${max_investment:.2f} could be allocated. Watch for {drawdown_pct:.1f}% drawdowns."
        else:
            profile_advice = "Unknown risk profile. Please choose: conservative, moderate, or aggressive."

        return f"""
-- Risk Profile Assessment for {risk_analysis_result['ticker']} --
Risk Profile: {risk_profile.capitalize()}
Timeframe: {risk_analysis_result['timeframe']}

Key Metrics:
- Volatility: {volatility:.4f}
- Max Drawdown: {max_drawdown:.2f}
- Sharpe Ratio: {sharpe_ratio:.3f}
- Value at Risk (VaR): {var:.4f} (~{var*100:.2f}% potential loss)

Investment Advice:
{profile_advice}

Suggested Position Size: {position_size}
--- END OF REPORT ---
"""

    def run_risk_analysis(self, risk_profile: str, capital: float, confidence_level=0.95) -> str:
        result = self.assess_risk_profile(risk_profile, capital)
        return self.investment_advice(risk_profile, capital, result)