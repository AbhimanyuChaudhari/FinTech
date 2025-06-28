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
  forecasted_log_returns: number[][];
  forecasted_prices?: number[][];
  original_log_returns: number[][];
  tickers: string[];
}

type ChartPoint = {
  index: number;
  [key: string]: number | undefined;
};

export default function VARForecastPage() {
  const { ticker } = useParams();
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"log" | "price">("log");
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState("2020-01-01");
  const [end, setEnd] = useState("2024-01-01");
  const [steps, setSteps] = useState(20);
  const [maxLag, setMaxLag] = useState(5);
  const [exogTickers, setExogTickers] = useState<string>("AAPL,MSFT,SPY");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://fintech-backend-80wz.onrender.com/api/statistical/var", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tickers: exogTickers.split(",").map(t => t.trim()),
          start,
          end,
          steps,
          max_lag: maxLag
        })
      });
      if (!res.ok) throw new Error("Failed to fetch forecast");
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
  }, []);

  const prepareChartData = (): ChartPoint[] => {
    if (!forecast) return [];

    const actual =
      viewMode === "log"
        ? forecast.original_log_returns
        : forecast.original_log_returns.map((_, i) => forecast.forecasted_prices?.[i] || []);

    const predicted =
      viewMode === "log"
        ? forecast.forecasted_log_returns
        : forecast.forecasted_prices || [];

    const data: ChartPoint[] = [];
    const nAssets = forecast.tickers.length;
    const actualLength = actual[0]?.length || 0;

    for (let i = 0; i < actualLength; i++) {
      const point: ChartPoint = { index: i };
      forecast.tickers.forEach((ticker, t) => {
        point[ticker] = actual[t][i];
      });
      data.push(point);
    }

    for (let j = 0; j < predicted[0]?.length; j++) {
      const point: ChartPoint = { index: actualLength + j };
      forecast.tickers.forEach((ticker, t) => {
        point[ticker + "_forecast"] = predicted[t][j];
      });
      data.push(point);
    }

    return data;
  };

  const chartData = prepareChartData();

  return (
    <div style={{ backgroundColor: "#0f172a", color: "#f1f5f9", minHeight: "100vh", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.8rem", color: "#60a5fa", marginBottom: "1rem" }}>
        VAR Model Forecast
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
          <input type="number" value={steps} onChange={e => setSteps(+e.target.value)} />
        </label>
        <label>
          Max Lag:
          <input type="number" value={maxLag} onChange={e => setMaxLag(+e.target.value)} />
        </label>
        <label>
          Tickers:
          <input type="text" value={exogTickers} onChange={e => setExogTickers(e.target.value)} />
        </label>
        <button onClick={fetchData} style={{ backgroundColor: "#38bdf8", padding: "0.5rem 1rem", border: "none", borderRadius: "6px", color: "white" }}>Forecast</button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setViewMode("log")} style={{ marginRight: "1rem", padding: "0.5rem 1rem", backgroundColor: viewMode === "log" ? "#38bdf8" : "#1e293b", color: "white", border: "none", borderRadius: "8px" }}>Log View</button>
        <button onClick={() => setViewMode("price")} style={{ padding: "0.5rem 1rem", backgroundColor: viewMode === "price" ? "#38bdf8" : "#1e293b", color: "white", border: "none", borderRadius: "8px" }}>Price View</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "#f87171" }}>{error}</p>
      ) : forecast ? (
        <div style={{ width: "100%", height: 400, background: "#1e293b", borderRadius: "12px", padding: "1rem" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="index" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "white" }} labelStyle={{ color: "white" }} />
              <Legend wrapperStyle={{ color: "#f1f5f9" }} />
              {forecast.tickers.map(ticker => (
                <Line key={ticker} type="monotone" dataKey={ticker} stroke="#38bdf8" dot={false} name={ticker} />
              ))}
              {forecast.tickers.map(ticker => (
                <Line key={ticker + "_forecast"} type="monotone" dataKey={ticker + "_forecast"} stroke="#facc15" dot={false} name={`${ticker} Forecast`} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
}
