import numpy as np
import yfinance as yf

class ARMA:
    def __init__(self, max_p=5, max_q=5):
        self.max_p = max_p
        self.max_q = max_q
        self.best_p = None
        self.best_q = None
        self.best_phi = None
        self.best_theta = None
        self.mu = None
        self.best_mse = None
        self.fitted = False
        self.series = None
        self.original_prices = None
        self.ticker = None
        self.start = None
        self.end = None

    def load_stock_data(self, ticker="AAPL", start="2020-01-01", end="2024-01-01"):
        self.ticker = ticker
        self.start = start
        self.end = end

        data = yf.download(ticker, start=start, end=end, progress=False)
        if data.empty or "Close" not in data.columns:
            raise ValueError(f"No valid 'Close' price data found for {ticker}.")
        close_prices = data["Close"].dropna().values.flatten().astype(float)
        log_returns = np.diff(np.log(close_prices))

        self.series = log_returns
        self.original_prices = close_prices
        return self.series

    def prepare_lagged_data(self, series, p, q, residuals):
        n = len(series)
        X = []
        y = []

        for t in range(max(p, q), n):
            row = []
            for i in range(1, p + 1):
                row.append(series[t - i])
            for j in range(1, q + 1):
                row.append(residuals[t - j] if t - j >= 0 else 0.0)

            X.append(row)
            y.append(series[t])

        return np.array(X), np.array(y)

    def fit_arma_model(self, series, p, q):
        n = len(series)
        residuals = np.zeros(n)
        X, y = self.prepare_lagged_data(series, p, q, residuals)
    
        try:
            X_b = np.hstack([np.ones((X.shape[0], 1)), X])
            beta = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y
            y_pred = X_b @ beta
            residuals[max(p, q):] = y - y_pred  # ✅ FIXED HERE
            mse = np.mean((y - y_pred) ** 2)
            return beta, mse
        except np.linalg.LinAlgError:
            return None, np.inf


    def evaluate_orders(self, series):
        series = np.array(series)
        self.mu = np.mean(series)
        series = series - self.mu

        best_mse = np.inf
        for p in range(self.max_p + 1):
            for q in range(self.max_q + 1):
                if p == 0 and q == 0:
                    continue
                beta, mse = self.fit_arma_model(series, p, q)
                if mse < best_mse:
                    best_mse = mse
                    self.best_p = p
                    self.best_q = q
                    self.best_mse = mse
                    self.best_beta = beta

        if self.best_beta is not None:
            self.best_phi = self.best_beta[1 : 1 + self.best_p]
            self.best_theta = self.best_beta[1 + self.best_p :]
            self.fitted = True

    def forecast(self, series, steps=10):
        if not self.fitted:
            raise ValueError("Model not fitted.")

        series = np.array(series)
        history = list(series - self.mu)
        residuals = [0.0] * len(history)

        forecasts = []

        for _ in range(steps):
            ar_terms = [history[-i] for i in range(1, self.best_p + 1)] if self.best_p > 0 else []
            ma_terms = [residuals[-j] for j in range(1, self.best_q + 1)] if self.best_q > 0 else []

            x = [1.0] + ar_terms + ma_terms
            beta = np.concatenate(([0.0], self.best_phi, self.best_theta))
            y_next = float(np.dot(x, beta))
            forecasts.append(y_next)
            residuals.append(0.0)  # assumed future innovation = 0
            history.append(y_next)

        return np.array(forecasts) + self.mu

    def reconstruct_prices_from_forecast(self, log_returns, forecast):
        extended = np.concatenate([log_returns, forecast])
        all_prices = np.exp(np.cumsum(extended))
        return all_prices[-len(forecast):]
