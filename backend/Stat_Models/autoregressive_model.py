import pandas as pd
import numpy as np
import yfinance as yf

# Updated ARModel to use log returns and reconstruct prices with confidence intervals

class ARModel:
    def __init__(self, max_p=20, penalty_lambda=0.0):
        self.max_p = max_p
        self.penalty_lambda = penalty_lambda
        self.best_p = None
        self.best_beta = None
        self.best_mse = None
        self.fitted = False
        self.series = None
        self.ticker = None
        self.start = None
        self.end = None

    def load_stock_data(self, ticker="AAPL", start="2020-01-01", end="2024-01-01"):
        data = yf.download(ticker, start=start, end=end, progress=False)
        if data.empty or "Close" not in data.columns:
            raise ValueError(f"No valid 'Close' price data found for {ticker}.")
        close_prices = data["Close"].dropna().values.flatten().astype(float)
        log_returns = np.diff(np.log(close_prices))  # log returns
        self.series = log_returns
        self.original_prices = close_prices  # Store for price reconstruction
        self.ticker = ticker
        self.start = start
        self.end = end
        return self.series

    def reconstruct_prices_from_forecast(self, log_returns, forecast):
        extended_log_returns = np.concatenate([log_returns, forecast])
        all_prices = np.exp(np.cumsum(extended_log_returns))
        return all_prices[-len(forecast):]

    def build_lagged_matrix(self, y, p):
        X = np.array([y[t - p:t][::-1] for t in range(p, len(y))])
        y_target = np.array([y[t] for t in range(p, len(y))])
        return X, y_target

    def fit_ar_model(self, X, y):
        X_b = np.hstack([np.ones((X.shape[0], 1)), X])
        beta = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y
        return beta

    def predict_ar_model(self, X, beta):
        X_b = np.hstack([np.ones((X.shape[0], 1)), X])
        return X_b @ beta

    def evaluate_orders(self, y):
        self.orders = []
        self.mses = []
        self.penalized_mses = []
        self.models = {}

        for p in range(1, self.max_p + 1):
            try:
                X, y_target = self.build_lagged_matrix(y, p)
                beta = self.fit_ar_model(X, y_target)
                beta = np.asarray(beta).flatten()
                y_pred = self.predict_ar_model(X, beta)
                mse = np.mean((y_target - y_pred) ** 2)
                penalized_mse = mse + self.penalty_lambda * p

                self.orders.append(p)
                self.mses.append(mse)
                self.penalized_mses.append(penalized_mse)
                self.models[p] = (beta, mse, penalized_mse)
            except np.linalg.LinAlgError:
                self.orders.append(p)
                self.mses.append(np.nan)
                self.penalized_mses.append(np.nan)

        self.best_p = self.orders[np.nanargmin(self.penalized_mses)]
        self.best_beta = self.models[self.best_p][0]
        self.best_mse = self.models[self.best_p][1]
        self.fitted = True

    def forecast(self, y, steps=10):
        if not self.fitted:
            raise ValueError("Model must be fitted before forecasting.")

        self.best_beta = np.array(self.best_beta).flatten().astype(float)
        y = np.array(y).flatten().astype(float)

        history = list(y[-self.best_p:])
        forecasts = []
        variances = []

        X, y_target = self.build_lagged_matrix(y, self.best_p)
        residuals = y_target - self.predict_ar_model(X, self.best_beta)
        sigma_sq = np.var(residuals)

        for _ in range(steps):
            X_new = [1] + history[-self.best_p:][::-1]
            y_next = float(np.dot(X_new, self.best_beta))
            forecasts.append(y_next)
            variances.append(sigma_sq)
            history.append(y_next)

        forecast_array = np.array(forecasts)
        std_err = np.sqrt(np.array(variances))
        ci_upper = forecast_array + 1.96 * std_err
        ci_lower = forecast_array - 1.96 * std_err

        return forecast_array, ci_upper, ci_lower

    def plot_mse(self):
        if not self.fitted:
            raise ValueError("Model must be fitted before plotting.")
        import matplotlib.pyplot as plt
        plt.figure(figsize=(10, 5))
        plt.plot(self.orders, self.mses, label="MSE")
        plt.plot(self.orders, self.penalized_mses, label=f"Penalized MSE (λ={self.penalty_lambda})", linestyle='--')
        plt.xlabel("AR Order (p)")
        plt.ylabel("Error")
        plt.title("MSE vs AR Order")
        plt.legend()
        plt.grid(True)
        plt.show()

    def plot_forecast(self, steps=20):
        if self.series is None or not self.fitted:
            raise ValueError("Series not loaded or model not fitted.")
        forecast, _, _ = self.forecast(self.series, steps)
        import matplotlib.pyplot as plt
        plt.plot(self.series, label="Log Returns (Actual)")
        plt.plot(range(len(self.series), len(self.series) + steps), forecast, label="Forecast", linestyle="--")
        plt.title(f"{self.ticker} Log Return Forecast using AR({self.best_p})")
        plt.legend()
        plt.grid(True)
        plt.show()
