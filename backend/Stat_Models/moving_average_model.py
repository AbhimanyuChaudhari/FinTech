import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import yfinance as yf

class MAModel:
    def __init__(self, max_q=10):
        self.max_q = max_q
        self.best_q = None
        self.best_theta = None
        self.best_mse = None
        self.fitted = False
        self.series = None
        self.original_prices = None
        self.ticker = None
        self.start = None
        self.end = None
        self.mu = None

    def load_stock_data(self, ticker="AAPL", start="2020-01-01", end="2024-01-01"):
        data = yf.download(ticker, start=start, end=end, progress=False)
        if data.empty or "Close" not in data.columns:
            raise ValueError(f"No valid 'Close' price data found for {ticker}.")
        close_prices = data["Close"].dropna().values.flatten().astype(float)
        log_returns = np.diff(np.log(close_prices))  # log returns
        self.series = log_returns
        self.original_prices = close_prices
        self.ticker = ticker
        self.start = start
        self.end = end
        return self.series

    def build_lagged_matrix(self, residuals, q):
        X = []
        y = []
        for t in range(q, len(residuals)):
            X.append(residuals[t - q:t][::-1])
            y.append(residuals[t])
        return np.array(X), np.array(y)

    def fit_ma_model(self, X, y):
        X_b = np.hstack([np.ones((X.shape[0], 1)), X])
        theta = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y
        return theta

    def predict_ma_model(self, X, theta):
        X_b = np.hstack([np.ones((X.shape[0], 1)), X])
        return X_b @ theta

    def evaluate_orders(self, y):
        self.orders = []
        self.mses = []
        self.models = []
        self.mu = np.mean(y)
        residuals = y - self.mu

        for q in range(1, self.max_q + 1):
            try:
                X, y_target = self.build_lagged_matrix(residuals, q)
                theta = self.fit_ma_model(X, y_target)
                y_pred = self.predict_ma_model(X, theta)
                mse = np.mean((y_target - y_pred) ** 2)

                self.orders.append(q)
                self.mses.append(mse)
                self.models.append((theta, mse))
            except np.linalg.LinAlgError:
                self.orders.append(q)
                self.mses.append(np.nan)
                self.models.append((None, np.nan))

        self.best_q = self.orders[np.nanargmin(self.mses)]
        self.best_theta = self.models[self.best_q - 1][0]
        self.best_mse = self.models[self.best_q - 1][1]
        self.fitted = True

    def forecast(self, y, steps=10):
        if self.series is None or not self.fitted:
            raise ValueError("Series not loaded or model not fitted.")

        theta = np.array(self.best_theta).flatten().astype(float)
        residuals = y - self.mu
        history = list(residuals[-self.best_q:])
        forecasts = []

        for _ in range(steps):
            X_new = [1] + history[-self.best_q:][::-1]
            y_next = float(np.dot(X_new, theta))
            forecasts.append(y_next)
            history.append(y_next)

        return np.array(forecasts) + self.mu

    def reconstruct_prices_from_forecast(self, log_returns, forecast):
        extended = np.concatenate([log_returns, forecast])
        all_prices = np.exp(np.cumsum(extended))
        return all_prices[-len(forecast):]

    def plot_mse(self):
        if not self.fitted:
            raise ValueError("Model must be fitted before plotting.")
        plt.figure(figsize=(10, 5))
        plt.plot(self.orders, self.mses, label="MSE")
        plt.xlabel("MA Order (q)")
        plt.ylabel("Error")
        plt.title("MSE vs MA Order")
        plt.legend()
        plt.grid(True)
        plt.show()

    def plot_forecast(self, steps=20):
        if self.series is None or not self.fitted:
            raise ValueError("Series not loaded or model not fitted.")
        forecast = self.forecast(self.series, steps)
        plt.plot(self.series, label="Log Returns (Actual)")
        plt.plot(range(len(self.series), len(self.series) + steps), forecast, label="Forecast", linestyle="--")
        plt.title(f"{self.ticker} Log Return Forecast using MA({self.best_q})")
        plt.legend()
        plt.grid(True)
        plt.show()
