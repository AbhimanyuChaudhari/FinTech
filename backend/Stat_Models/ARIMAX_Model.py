# backend/Stat_Models/ARIMAX_Model.py

import numpy as np
import yfinance as yf
from sklearn.metrics import mean_squared_error, mean_absolute_error

class ARIMAX:
    def __init__(self, max_p=5, max_q=5, d=1):
        self.max_p = max_p
        self.max_q = max_q
        self.d = d
        self.best_p = None
        self.best_q = None
        self.best_beta = None
        self.best_mse = float("inf")
        self.best_mae = float("inf")
        self.fitted = False

    def load_data(self, ticker, exog_ticker, start, end):
        y_data = yf.download(ticker, start=start, end=end, progress=False)["Close"].dropna()
        x_data = yf.download(exog_ticker, start=start, end=end, progress=False)["Close"].dropna()

        common_index = y_data.index.intersection(x_data.index)
        y_prices = y_data.loc[common_index].values.flatten()
        x_prices = x_data.loc[common_index].values.flatten()

        y_log_returns = np.diff(np.log(y_prices))
        x_log_returns = np.diff(np.log(x_prices))

        min_len = min(len(y_log_returns), len(x_log_returns))
        self.series = y_log_returns[:min_len].flatten()
        self.exog_series = x_log_returns[:min_len].flatten()
        return self.series, self.exog_series

    def difference(self, series):
        for _ in range(self.d):
            series = np.diff(series)
        return series

    def build_matrix(self, y, x, p):
        X, Y = [], []
        for t in range(p, len(y)):
            row = [1.0]  # intercept
            row += list(y[t - p:t][::-1]) if p > 0 else []
            row.append(x[t])  # exogenous input at time t
            X.append(row)
            Y.append(y[t])
        return np.array(X, dtype=float), np.array(Y, dtype=float)

    def fit_model(self, y, x, p):
        X, Y = self.build_matrix(y, x, p)
        if X.shape[0] == 0:
            return None, np.inf, np.inf
        try:
            beta = np.linalg.pinv(X.T @ X) @ X.T @ Y
            y_pred = X @ beta
            mse = mean_squared_error(Y, y_pred)
            mae = mean_absolute_error(Y, y_pred)
            return beta, mse, mae
        except Exception:
            return None, np.inf, np.inf

    def evaluate_orders(self):
        y = self.difference(self.series)
        x = self.exog_series[-len(y):]  # align

        for p in range(1, self.max_p + 1):  # skip p=0 to avoid empty lags
            for q in range(0, self.max_q + 1):  # unused but for parity
                beta, mse, mae = self.fit_model(y, x, p)
                if beta is not None and mse < self.best_mse:
                    self.best_p, self.best_q = p, q
                    self.best_beta = beta
                    self.best_mse = mse
                    self.best_mae = mae
                    self.fitted = True

        if not self.fitted:
            raise ValueError("No valid model found")

        self.diffed_y = y
        self.diffed_x = x

    def forecast(self, steps):
        y_hist = list(self.diffed_y)
        x_hist = list(self.diffed_x)
        forecasted = []

        for _ in range(steps):
            row = [1.0]
            row += y_hist[-self.best_p:][::-1]
            row.append(x_hist[-1])  # assume exog stays flat
            y_next = float(np.dot(row, self.best_beta))
            forecasted.append(y_next)
            y_hist.append(y_next)
            x_hist.append(x_hist[-1])
        return np.array(forecasted)

    def reconstruct_prices(self, forecast_diffed):
        # Combine original + forecasted log returns
        full_series = np.concatenate([self.series, forecast_diffed])
        full_prices = np.exp(np.cumsum(full_series))
        # Separate into actual and forecasted price parts
        actual_prices = full_prices[:-len(forecast_diffed)]
        forecasted_prices = full_prices[-len(forecast_diffed):]
        return actual_prices, forecasted_prices
