import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ForecastResponse {
  forecasted_log_returns: number[];
  forecasted_prices?: number[];
  best_p: number;
  best_q: number;
  best_P: number;
  best_Q: number;
  mse: number;
  mae?: number;
  original_log_returns: number[];
}

export default function SARIMAForecastPage() {
  const { ticker } = useParams();
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [start, setStart] = useState("2020-01-01");
  const [end, setEnd] = useState("2024-01-01");
  const [steps, setSteps] = useState(20);
  const [maxP, setMaxP] = useState(5);
  const [maxQ, setMaxQ] = useState(5);
  const [seasonalPeriod, setSeasonalPeriod] = useState(12);
  const [seasonalD, setSeasonalD] = useState(1);
  const [maxSeasonalP, setMaxSeasonalP] = useState(2);
  const [maxSeasonalQ, setMaxSeasonalQ] = useState(2);
  const [showPrices, setShowPrices] = useState(false);

  const fetchData = async () => {
    if (!ticker) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/statistical/sarima", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          start,
          end,
          steps,
          d: 1,
          D: seasonalD,
          s: seasonalPeriod,
          max_p: maxP,
          max_q: maxQ,
          max_P: maxSeasonalP,
          max_Q: maxSeasonalQ,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch forecast");
      const data = await res.json();
      setForecast({
        forecasted_log_returns: data.forecast,
        forecasted_prices: data.forecasted_prices,
        best_p: data.order[0],
        best_q: data.order[1],
        best_P: data.seasonal_order[0],
        best_Q: data.seasonal_order[1],
        mse: data.mse,
        mae: data.mae,
        original_log_returns: data.actual_log_returns,
      });
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch forecast. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ticker]);

  const chartData = forecast
    ? showPrices && forecast.forecasted_prices
      ? forecast.forecasted_prices.map((val, i) => ({
          index: (forecast.original_log_returns?.length ?? 0) + i,
          forecast: val,
        }))
      : [
          ...(forecast.original_log_returns?.map((val, i) => ({
            index: i,
            actual: val,
          })) ?? []),
          ...(forecast.forecasted_log_returns?.map((val, i) => ({
            index: (forecast.original_log_returns?.length ?? 0) + i,
            forecast: val,
          })) ?? []),
        ]
    : [];

  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        color: "#f1f5f9",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "1.8rem", color: "#60a5fa", marginBottom: "1rem" }}>
        SARIMA Model Forecast for {ticker}
      </h1>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1rem",
          alignItems: "center",
        }}
      >
        <label>Start Date: <input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label>End Date: <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        <label>Steps: <input type="number" min={1} value={steps} onChange={(e) => setSteps(+e.target.value)} /></label>
        <label>Max P: <input type="number" min={0} value={maxP} onChange={(e) => setMaxP(+e.target.value)} /></label>
        <label>Max Q: <input type="number" min={0} value={maxQ} onChange={(e) => setMaxQ(+e.target.value)} /></label>
        <label>Seasonal Period (s): <input type="number" min={1} value={seasonalPeriod} onChange={(e) => setSeasonalPeriod(+e.target.value)} /></label>
        <label>Seasonal D: <input type="number" min={0} value={seasonalD} onChange={(e) => setSeasonalD(+e.target.value)} /></label>
        <label>Max Seasonal P: <input type="number" min={0} value={maxSeasonalP} onChange={(e) => setMaxSeasonalP(+e.target.value)} /></label>
        <label>Max Seasonal Q: <input type="number" min={0} value={maxSeasonalQ} onChange={(e) => setMaxSeasonalQ(+e.target.value)} /></label>
        <label><input type="checkbox" checked={showPrices} onChange={(e) => setShowPrices(e.target.checked)} /> Show Prices</label>
        <button
          onClick={fetchData}
          style={{ backgroundColor: "#38bdf8", padding: "0.5rem 1rem", border: "none", borderRadius: "6px", color: "white" }}
        >
          Forecast
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "#f87171" }}>{error}</p>
      ) : forecast ? (
        <>
          <p><strong>Best Order (p, q):</strong> ({forecast.best_p}, {forecast.best_q})</p>
          <p><strong>Best Seasonal (P, Q):</strong> ({forecast.best_P}, {forecast.best_Q})</p>
          <p><strong>MSE:</strong> {forecast.mse.toFixed(6)}</p>
          {forecast.mae !== undefined && <p><strong>MAE:</strong> {forecast.mae.toFixed(6)}</p>}

          <div style={{ width: "100%", height: 400, background: "#1e293b", borderRadius: "12px", padding: "1rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="index" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "white" }} labelStyle={{ color: "white" }} />
                <Legend wrapperStyle={{ color: "#f1f5f9" }} />
                {!showPrices && <Line type="monotone" dataKey="actual" stroke="#38bdf8" dot={false} name="Actual" />}
                <Line type="monotone" dataKey="forecast" stroke="#facc15" dot={false} name="Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : null}
    </div>
  );
}
