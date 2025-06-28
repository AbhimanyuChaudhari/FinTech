import numpy as np
import yfinance as yf

class ARIMA:
    def __init__(self, max_p=5, max_q=5, d=1):
        self.max_p = max_p
        self.max_q = max_q
        self.d = d
        self.best_p = None
        self.best_q = None
        self.best_mse = float('inf')
        self.best_beta = None
        self.fitted = False
        self.series = None
        self.diffed_series = None
        self.original_prices = None
        self.ticker = None

    def load_stock_data(self, ticker="AAPL", start="2020-01-01", end="2024-01-01"):
        data = yf.download(ticker, start=start, end=end, progress=False)
        close_prices = data["Close"].dropna().values.flatten().astype(float)
        log_returns = np.diff(np.log(close_prices))
        self.series = log_returns
        self.original_prices = close_prices
        self.ticker = ticker
        return self.series

    def difference_series(self, series):
        diffed = series.copy()
        for _ in range(self.d):
            diffed = np.diff(diffed)
        return diffed

    def build_lagged_matrix(self, series, p, q):
        n = len(series)
        max_lag = max(p, q)
        if n <= max_lag:
            return None, None

        X, y = [], []
        for t in range(max_lag, n):
            ar_terms = series[t - p:t][::-1] if p > 0 else []
            ma_terms = [0.0] * q
            X.append([1.0] + list(ar_terms) + list(ma_terms))
            y.append(series[t])
        return np.array(X), np.array(y)

    def fit_arma(self, series, p, q):
        X, y = self.build_lagged_matrix(series, p, q)
        if X is None:
            return None, float('inf')
        try:
            beta = np.linalg.inv(X.T @ X) @ X.T @ y
            y_pred = X @ beta
            mse = np.mean((y - y_pred) ** 2)
            return beta, mse
        except np.linalg.LinAlgError:
            return None, float('inf')

          

    def evaluate_orders(self, series):
        self.diffed_series = self.difference_series(series)
        best_mse = float('inf')
        for p in range(self.max_p + 1):
            for q in range(self.max_q + 1):
                if p == 0 and q == 0:
                    continue
                beta, mse = self.fit_arma(self.diffed_series, p, q)
                if mse < best_mse:
                    best_mse = mse
                    self.best_p = p
                    self.best_q = q
                    self.best_beta = beta
                    self.best_mse = mse
        self.fitted = True

    def forecast(self, steps=10):
        if not self.fitted:
            raise ValueError("Model not fitted.")

        forecasted = []
        history = list(self.diffed_series)
        for _ in range(steps):
            ar_terms = history[-self.best_p:][::-1] if self.best_p > 0 else []
            ma_terms = [0.0] * self.best_q
            X = [1.0] + list(ar_terms) + list(ma_terms)
            y_next = float(np.dot(X, self.best_beta))
            forecasted.append(y_next)
            history.append(y_next)
        return np.array(forecasted)

    def reconstruct_forecast(self, forecast_diffed):
        restored = self.series.copy()
        for _ in range(self.d):
            last_val = restored[-1]
            cumulative = np.cumsum(np.insert(forecast_diffed, 0, last_val))
            restored = np.concatenate([restored, cumulative[1:]])
        return np.exp(np.cumsum(restored))[-len(forecast_diffed):]
