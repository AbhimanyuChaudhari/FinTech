// src/pages/ARIMAForecastPage.tsx
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
  forecast: number[];
  order: { p: number; d: number; q: number };
  mse: number;
  actual_log_returns?: number[];
  forecasted_prices?: number[];
  actual_prices?: number[];
}

export default function ARIMAForecastPage() {
  const { ticker } = useParams();
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"log" | "price">("log");
  const [start, setStart] = useState("2022-01-01");
  const [end, setEnd] = useState("2024-01-01");
  const [steps, setSteps] = useState(20);
  const [maxP, setMaxP] = useState(5);
  const [maxQ, setMaxQ] = useState(5);
  const [d, setD] = useState(1);

  const fetchData = async () => {
    if (!ticker) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/statistical/arima", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, start, end, steps, max_p: maxP, max_q: maxQ, d })
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setForecast(data);
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

  const prepareChartData = () => {
    if (!forecast) return [];
    const historical = viewMode === "log" ? forecast.actual_log_returns || [] : forecast.actual_prices || [];
    const predicted = viewMode === "log" ? forecast.forecast || [] : forecast.forecasted_prices || [];

    const data = [];
    for (let i = 0; i < historical.length; i++) {
      data.push({ index: i, actual: historical[i] });
    }
    for (let j = 0; j < predicted.length; j++) {
      data.push({
        index: historical.length + j,
        forecast: predicted[j]
      });
    }
    return data;
  };

  const chartData = prepareChartData();

  return (
    <div style={{ backgroundColor: "#0f172a", color: "#f1f5f9", minHeight: "100vh", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.8rem", color: "#60a5fa", marginBottom: "1rem" }}>
        ARIMA Forecast for {ticker}
      </h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
        <label>
          Start:
          <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        </label>
        <label>
          End:
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
        </label>
        <label>
          Steps:
          <input type="number" value={steps} min={1} onChange={e => setSteps(Number(e.target.value))} />
        </label>
        <label>
          d:
          <input type="number" value={d} min={0} onChange={e => setD(Number(e.target.value))} />
        </label>
        <label>
          max_p:
          <input type="number" value={maxP} min={0} onChange={e => setMaxP(Number(e.target.value))} />
        </label>
        <label>
          max_q:
          <input type="number" value={maxQ} min={0} onChange={e => setMaxQ(Number(e.target.value))} />
        </label>
        <button onClick={fetchData} style={{ backgroundColor: "#38bdf8", padding: "0.5rem 1rem", borderRadius: "6px", color: "white" }}>
          Forecast
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setViewMode("log")} style={{ marginRight: "1rem", padding: "0.5rem 1rem", backgroundColor: viewMode === "log" ? "#38bdf8" : "#1e293b", color: "white" }}>Log Returns</button>
        <button onClick={() => setViewMode("price")} style={{ padding: "0.5rem 1rem", backgroundColor: viewMode === "price" ? "#38bdf8" : "#1e293b", color: "white" }}>Price</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "#f87171" }}>{error}</p>
      ) : forecast ? (
        <>
          <p><strong>Order:</strong> (p={forecast.order.p}, d={forecast.order.d}, q={forecast.order.q})</p>
          <p><strong>MSE:</strong> {forecast.mse.toFixed(6)}</p>

          <div style={{ width: "100%", height: 400, background: "#1e293b", borderRadius: "12px", padding: "1rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="index" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "white" }} />
                <Legend wrapperStyle={{ color: "#f1f5f9" }} />
                <Line type="monotone" dataKey="actual" stroke="#38bdf8" dot={false} name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="#facc15" dot={false} name="Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : null}
    </div>
  );
}
