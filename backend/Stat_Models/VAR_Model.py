import numpy as np
import yfinance as yf
from sklearn.metrics import mean_squared_error, mean_absolute_error
import pandas as pd

class VAR:
    def __init__(self, tickers, max_lag=5):
        self.tickers = tickers
        self.max_lag = max_lag
        self.data = None
        self.log_returns = None
        self.best_lag = None
        self.beta = None
        self.mse = float("inf")
        self.mae = float("inf")
        self.fitted = False

    def load_data(self, start="2020-01-01", end="2024-01-01"):
        panel = yf.download(self.tickers, start=start, end=end, progress=False)["Close"].dropna()

        if isinstance(panel, pd.Series):
            panel = panel.to_frame()

        log_returns = np.log(panel / panel.shift(1)).dropna()
        self.data = panel
        self.log_returns = log_returns
        return log_returns

    def create_lagged_matrix(self, returns, lag):
        X, Y = [], []
        for t in range(lag, len(returns)):
            x_row = returns.iloc[t-lag:t].values.flatten()
            y_row = returns.iloc[t].values
            X.append(x_row)
            Y.append(y_row)
        return np.array(X), np.array(Y)

    def fit(self):
        best_mse = float("inf")
        best_beta = None
        for lag in range(1, self.max_lag + 1):
            X, Y = self.create_lagged_matrix(self.log_returns, lag)
            if X.shape[0] == 0:
                continue
            try:
                beta = np.linalg.pinv(X.T @ X) @ X.T @ Y
                Y_pred = X @ beta
                mse = mean_squared_error(Y, Y_pred)
                mae = mean_absolute_error(Y, Y_pred)
                if mse < best_mse:
                    best_mse = mse
                    self.beta = beta
                    self.best_lag = lag
                    self.mse = mse
                    self.mae = mae
                    self.fitted = True
            except Exception as e:
                continue

        if not self.fitted:
            raise ValueError("VAR model fitting failed. No valid model found.")

    def forecast(self, steps=10):
        if not self.fitted:
            raise ValueError("Model must be fitted before forecasting.")

        forecasted = []
        history = self.log_returns.values[-self.best_lag:].tolist()

        for _ in range(steps):
            x_input = np.array(history[-self.best_lag:]).flatten()
            y_next = x_input @ self.beta
            forecasted.append(y_next)
            history.append(y_next)

        return np.array(forecasted)

    def reconstruct_prices(self, forecasted_log_returns):
        last_prices = self.data.iloc[-1].values
        cum_returns = np.vstack([np.zeros_like(last_prices), forecasted_log_returns]).cumsum(axis=0)
        return (np.exp(cum_returns) * last_prices).tolist()