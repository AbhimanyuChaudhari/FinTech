import pandas as pd
import yfinance as yf


class TechnicalAnalysis:
    def __init__(self, ticker):
        self.ticker = ticker
        self.data = self.fetch_data()

    def fetch_data(self):
        df = yf.download(self.ticker, period='max')
        if df.empty:
            raise ValueError(f"No data returned for {self.ticker}")
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.map(lambda x: x[0])
        return df

    def calculate_indicators(self):
        df = self.data.copy()
        close = df['Close']
        high = df['High']
        low = df['Low']
        volume = df['Volume']

        delta = close.diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        avg_gain = gain.rolling(14).mean()
        avg_loss = loss.rolling(14).mean()
        rs = avg_gain / avg_loss
        df['RSI'] = 100 - (100 / (1 + rs))

        df['EMA_20'] = close.ewm(span=20, adjust=False).mean()

        obv = [0]
        for i in range(1, len(df)):
            if close.iloc[i] > close.iloc[i - 1]:
                obv.append(obv[-1] + volume.iloc[i])
            elif close.iloc[i] < close.iloc[i - 1]:
                obv.append(obv[-1] - volume.iloc[i])
            else:
                obv.append(obv[-1])
        df['OBV'] = obv

        tr = pd.concat([high - low, abs(high - close.shift()), abs(low - close.shift())], axis=1).max(axis=1)
        df['ATR'] = tr.rolling(14).mean()

        df['STD_20'] = close.rolling(20).std()

        tp = (high + low + close) / 3
        money_flow = tp * volume
        pos_flow = money_flow.where(tp > tp.shift(), 0).rolling(14).sum()
        neg_flow = money_flow.where(tp < tp.shift(), 0).rolling(14).sum()
        df['MFI'] = 100 * pos_flow / (pos_flow + neg_flow)

        aroon_up = df['High'].rolling(25).apply(lambda x: x.argmax() / 25 * 100, raw=True)
        aroon_down = df['Low'].rolling(25).apply(lambda x: x.argmin() / 25 * 100, raw=True)
        df['Aroon_Up'] = aroon_up
        df['Aroon_Down'] = aroon_down

        sma = close.rolling(20).mean()
        std = close.rolling(20).std()
        df['Upper_BB'] = sma + 2 * std
        df['Lower_BB'] = sma - 2 * std

        ema12 = close.ewm(span=12, adjust=False).mean()
        ema26 = close.ewm(span=26, adjust=False).mean()
        macd = ema12 - ema26
        signal = macd.ewm(span=9, adjust=False).mean()
        df['MACD'] = macd
        df['PPO'] = ((ema12 - ema26) / ema26) * 100

        plus_dm = high.diff()
        minus_dm = low.diff()
        trur = tr.rolling(14).sum()
        plus_di = 100 * (plus_dm.rolling(14).sum() / trur)
        minus_di = 100 * (minus_dm.rolling(14).sum() / trur)
        dx = 100 * abs(plus_di - minus_di) / (plus_di + minus_di)
        df['ADX'] = dx.rolling(14).mean()

        low14 = low.rolling(14).min()
        high14 = high.rolling(14).max()
        df['Stoch_K'] = 100 * (close - low14) / (high14 - low14)
        df['Stoch_D'] = df['Stoch_K'].rolling(3).mean()

        cci = (tp - tp.rolling(20).mean()) / (0.015 * tp.rolling(20).std())
        df['CCI'] = cci

        clv = ((close - low) - (high - close)) / (high - low)
        adl = (clv * volume).cumsum()
        df['ADL'] = adl

        mfv = clv * volume
        cmf = mfv.rolling(20).sum() / volume.rolling(20).sum()
        df['CMF'] = cmf

        return df.dropna()


class TechnicalSignalEvaluator:
    def __init__(self, ticker, weights, threshold=3):
        self.ticker = ticker
        self.weights = weights
        self.threshold = threshold
        ta = TechnicalAnalysis(ticker)
        self.df = ta.calculate_indicators()

    def generate_final_score(self):
        df = self.df
        latest = df.iloc[-1]
        prev = df.iloc[-2]
        score = 0
        details = []

        def add_score(name, condition, rationale, weight):
            nonlocal score
            indicator_score = weight * condition
            score += indicator_score
            if weight != 0:
                details.append(f"{name}: {rationale} → Score: {indicator_score}")

        add_score("RSI", 1 if latest['RSI'] < 30 else -1 if latest['RSI'] > 70 else 0,
                  f"RSI = {latest['RSI']:.2f} (Buy if < 30, Sell if > 70)", self.weights.get('RSI', 0))

        add_score("EMA", 1 if latest['Close'] > latest['EMA_20'] else -1,
                  f"Close = {latest['Close']:.2f}, EMA_20 = {latest['EMA_20']:.2f}", self.weights.get('EMA', 0))

        add_score("OBV", 1 if latest['OBV'] > prev['OBV'] else -1,
                  f"OBV rising: {prev['OBV']:.2f} → {latest['OBV']:.2f}", self.weights.get('OBV', 0))

        add_score("ATR", 1 if latest['ATR'] < df['ATR'].rolling(20).mean().iloc[-1] else -1,
                  f"ATR = {latest['ATR']:.2f}, 20-day mean = {df['ATR'].rolling(20).mean().iloc[-1]:.2f}", self.weights.get('ATR', 0))

        add_score("STD", 1 if latest['STD_20'] < df['STD_20'].rolling(20).mean().iloc[-1] else -1,
                  f"STD = {latest['STD_20']:.2f}, 20-day mean = {df['STD_20'].rolling(20).mean().iloc[-1]:.2f}", self.weights.get('STD', 0))

        add_score("MFI", 1 if latest['MFI'] < 20 else -1 if latest['MFI'] > 80 else 0,
                  f"MFI = {latest['MFI']:.2f} (Buy if < 20, Sell if > 80)", self.weights.get('MFI', 0))

        add_score("Aroon", 1 if latest['Aroon_Up'] > latest['Aroon_Down'] else -1,
                  f"Aroon Up = {latest['Aroon_Up']:.2f}, Down = {latest['Aroon_Down']:.2f}", self.weights.get('Aroon', 0))

        add_score("Bollinger", 1 if latest['Close'] < latest['Lower_BB'] else -1 if latest['Close'] > latest['Upper_BB'] else 0,
                  f"Close = {latest['Close']:.2f}, BB Lower = {latest['Lower_BB']:.2f}, Upper = {latest['Upper_BB']:.2f}", self.weights.get('Bollinger', 0))

        add_score("MACD", 1 if latest['MACD'] > prev['MACD'] else -1,
                  f"MACD: {prev['MACD']:.2f} → {latest['MACD']:.2f}", self.weights.get('MACD', 0))

        add_score("PPO", 1 if latest['PPO'] > 0 else -1,
                  f"PPO = {latest['PPO']:.2f} (positive is bullish)", self.weights.get('PPO', 0))

        add_score("ADX", 1 if latest['ADX'] > 20 else -1,
                  f"ADX = {latest['ADX']:.2f} (Above 20 indicates trend strength)", self.weights.get('ADX', 0))

        add_score("Stochastic", 1 if latest['Stoch_K'] > latest['Stoch_D'] and latest['Stoch_K'] < 20 else
                  -1 if latest['Stoch_K'] < latest['Stoch_D'] and latest['Stoch_K'] > 80 else 0,
                  f"%K = {latest['Stoch_K']:.2f}, %D = {latest['Stoch_D']:.2f}", self.weights.get('Stochastic', 0))

        add_score("CCI", 1 if latest['CCI'] < -100 else -1 if latest['CCI'] > 100 else 0,
                  f"CCI = {latest['CCI']:.2f} (Buy if < -100, Sell if > 100)", self.weights.get('CCI', 0))

        add_score("ADL", 1 if latest['ADL'] > prev['ADL'] else -1,
                  f"ADL rising: {prev['ADL']:.2f} → {latest['ADL']:.2f}", self.weights.get('ADL', 0))

        add_score("CMF", 1 if latest['CMF'] > 0 else -1,
                  f"CMF = {latest['CMF']:.2f} (Above 0 is bullish)", self.weights.get('CMF', 0))

        return score, details

    def make_decision(self):
        score, details = self.generate_final_score()

        decision = (
            f"📈 BUY Signal (Score: {score})" if score >= self.threshold else
            f"📉 SELL Signal (Score: {score})" if score <= -self.threshold else
            f"⏸️ HOLD Signal (Score: {score})"
        )

        explanation_header = (
            f"\n--- Detailed Indicator Analysis for {self.ticker} ---\n"
            f"Total Composite Score: {score} | Threshold: ±{self.threshold}\n"
            f"Interpretation: A higher positive score favors buying; a lower negative score favors selling.\n\n"
            f"Indicator Breakdown:\n"
        )

        # Group indicators by type
        category_map = {
            'RSI': 'Momentum',
            'MACD': 'Momentum',
            'Stochastic': 'Momentum',
            'CCI': 'Momentum',
            'PPO': 'Momentum',
            'EMA': 'Trend',
            'ADX': 'Trend',
            'Aroon': 'Trend',
            'OBV': 'Volume',
            'ADL': 'Volume',
            'CMF': 'Volume',
            'ATR': 'Volatility',
            'STD': 'Volatility',
            'MFI': 'Volume & Momentum',
            'Bollinger': 'Volatility'
        }

        grouped_details = {}
        for line in details:
            for ind, cat in category_map.items():
                if line.startswith(ind):
                    grouped_details.setdefault(cat, []).append(line)
                    break

        explanation = ""
        for category in ['Momentum', 'Trend', 'Volume', 'Volatility', 'Volume & Momentum']:
            if category in grouped_details:
                explanation += f"\n🔹 {category} Indicators:\n"
                for detail in grouped_details[category]:
                    explanation += f"   - {detail}\n"

        return f"{decision}\n{explanation_header}{explanation}"
