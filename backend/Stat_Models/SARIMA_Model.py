import numpy as np
import yfinance as yf
from sklearn.metrics import mean_squared_error, mean_absolute_error

class SARIMA:
    def __init__(self, d=1, D=1, s=12, max_p=3, max_q=0, max_P=2, max_Q=0):
        self.d = d
        self.D = D
        self.s = s
        self.max_p = max_p
        self.max_q = max_q
        self.max_P = max_P
        self.max_Q = max_Q

        self.best_p = self.best_q = self.best_P = self.best_Q = 0
        self.best_beta = None
        self.best_mse = float('inf')
        self.best_mae = float('inf')

        self.fitted = False
        self.series = None
        self.diffed = None
        self.original_prices = None
        self.ticker = None

    def load_stock_data(self, ticker="AAPL", start="2020-01-01", end="2024-01-01"):
        data = yf.download(ticker, start=start, end=end, progress=False)
        prices = data["Close"].dropna().values.flatten().astype(float)
        log_returns = np.diff(np.log(prices))
        self.series = log_returns
        self.original_prices = prices
        self.ticker = ticker
        return log_returns

    def difference(self, series):
        for _ in range(self.d):
            series = np.diff(series)
        for _ in range(self.D):
            series = series[self.s:] - series[:-self.s]
        return series

    def build_lagged_matrix(self, series, p, P):
        X, y = [], []
        max_lag = max(p, P * self.s)
        expected_len = 1 + p + P  # intercept + AR + seasonal AR

        for t in range(max_lag, len(series)):
            row = [1.0]
            if p > 0:
                ar_terms = series[t - p:t][::-1]
                if len(ar_terms) != p:
                    continue
                row += list(ar_terms)
            if P > 0:
                seasonal_terms = [series[t - self.s * i] for i in range(1, P + 1)]
                if len(seasonal_terms) != P:
                    continue
                row += seasonal_terms

            if len(row) == expected_len:
                X.append(row)
                y.append(series[t])

        # Suppressed debug print to avoid spamming console
        return np.array(X, dtype=float), np.array(y, dtype=float)

    def fit_model(self, series, p, q, P, Q):
        diffed = self.difference(series)
        self.diffed = diffed
        X, y = self.build_lagged_matrix(diffed, p, P)
        if X.shape[0] == 0 or X.shape[1] == 0:
            return None, np.inf, np.inf
        try:
            beta = np.linalg.pinv(X.T @ X) @ X.T @ y
            y_pred = X @ beta
            mse = mean_squared_error(y, y_pred)
            mae = mean_absolute_error(y, y_pred)
            return beta, mse, mae
        except np.linalg.LinAlgError:
            return None, np.inf, np.inf

    def evaluate_orders(self, series):
        best_mse = float("inf")
        for p in range(self.max_p + 1):
            for q in range(self.max_q + 1):
                for P in range(self.max_P + 1):
                    for Q in range(self.max_Q + 1):
                        if p == q == P == Q == 0:
                            continue
                        beta, mse, mae = self.fit_model(series, p, q, P, Q)
                        if beta is not None and mse < best_mse:
                            self.best_p, self.best_q, self.best_P, self.best_Q = p, q, P, Q
                            self.best_beta = beta
                            self.best_mse = mse
                            self.best_mae = mae
                            self.fitted = True

        if not self.fitted:
            raise ValueError("SARIMA: No valid model found for the given configuration.")

    def forecast(self, steps=10):
        if not self.fitted:
            raise ValueError("Model not fitted yet.")

        forecasted = []
        history = list(self.diffed)
        for _ in range(steps):
            row = [1.0]
            if self.best_p > 0:
                row += history[-self.best_p:][::-1]
            if self.best_P > 0:
                row += [history[-self.s * i] for i in range(1, self.best_P + 1)]
            y_next = float(np.dot(row, self.best_beta))
            forecasted.append(y_next)
            history.append(y_next)
        return np.array(forecasted)

    def reconstruct_prices(self, original_log_returns, forecast_diffed):
        full_series = np.concatenate([original_log_returns, forecast_diffed])
        return np.exp(np.cumsum(full_series))[-len(forecast_diffed):]
