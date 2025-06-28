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
  ResponsiveContainer
} from "recharts";

interface ForecastResponse {
  forecasted_log_returns: number[];
  forecasted_prices?: number[];
  actual_prices?: number[];
  best_p: number;
  best_q: number;
  mse: number;
  mae?: number;
  original_log_returns: number[];
}

type ChartPoint = {
  index: number;
  actual?: number;
  forecast?: number;
};

export default function ARIMAXForecastPage() {
  const { ticker } = useParams();
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"log" | "price">("log");
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState("2020-01-01");
  const [end, setEnd] = useState("2024-01-01");
  const [steps, setSteps] = useState(20);
  const [maxP, setMaxP] = useState(5);
  const [maxQ, setMaxQ] = useState(5);
  const [exogTicker, setExogTicker] = useState("SPY");

  const fetchData = async () => {
    if (!ticker) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/statistical/arimax`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          exog_ticker: exogTicker,
          start,
          end,
          steps,
          d: 1,
          max_p: maxP,
          max_q: maxQ
        })
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

  const prepareChartData = (): ChartPoint[] => {
    if (!forecast) return [];

    const actual =
      viewMode === "log"
        ? forecast.original_log_returns
        : forecast.actual_prices ?? [];

    const predicted =
      viewMode === "log"
        ? forecast.forecasted_log_returns
        : forecast.forecasted_prices ?? [];

    const data: ChartPoint[] = [];

    for (let i = 0; i < actual.length; i++) {
      data.push({ index: i, actual: actual[i] });
    }
    for (let j = 0; j < predicted.length; j++) {
      data.push({ index: actual.length + j, forecast: predicted[j] });
    }

    return data;
  };

  const chartData = prepareChartData();

  return (
    <div style={{ backgroundColor: "#0f172a", color: "#f1f5f9", minHeight: "100vh", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.8rem", color: "#60a5fa", marginBottom: "1rem" }}>
        ARIMAX Model Forecast for {ticker}
      </h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
        <label>Start Date:<input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label>End Date:<input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        <label>Steps:<input type="number" min={1} value={steps} onChange={(e) => setSteps(Number(e.target.value))} /></label>
        <label>Max P:<input type="number" min={0} value={maxP} onChange={(e) => setMaxP(Number(e.target.value))} /></label>
        <label>Max Q:<input type="number" min={0} value={maxQ} onChange={(e) => setMaxQ(Number(e.target.value))} /></label>
        <label>Exogenous Ticker:<input type="text" value={exogTicker} onChange={(e) => setExogTicker(e.target.value)} /></label>
        <button onClick={fetchData} style={{ backgroundColor: "#38bdf8", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "6px" }}>
          Forecast
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setViewMode("log")} style={{ marginRight: "1rem", padding: "0.5rem 1rem", backgroundColor: viewMode === "log" ? "#38bdf8" : "#1e293b", color: "white", border: "none", borderRadius: "8px" }}>
          Log Return View
        </button>
        <button onClick={() => setViewMode("price")} style={{ padding: "0.5rem 1rem", backgroundColor: viewMode === "price" ? "#38bdf8" : "#1e293b", color: "white", border: "none", borderRadius: "8px" }}>
          Price View
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "#f87171" }}>{error}</p>
      ) : forecast ? (
        <>
          <p><strong>Best Order:</strong> AR({forecast.best_p}), MA({forecast.best_q})</p>
          <p><strong>MSE:</strong> {forecast.mse.toFixed(6)}</p>
          {forecast.mae !== undefined && <p><strong>MAE:</strong> {forecast.mae.toFixed(6)}</p>}

          <div style={{ width: "100%", height: 400, background: "#1e293b", borderRadius: "12px", padding: "1rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="index" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "white" }} labelStyle={{ color: "white" }} />
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
