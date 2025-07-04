// components/StockCandleChart.tsx
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

interface CandleData {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
}

const StockCandleChart = ({
  ticker,
  interval
}: {
  ticker: string;
  interval: string;
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [values, setValues] = useState<number[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) return;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/ohlc?ticker=${ticker}&interval=${interval}`
        );
        const raw = await res.json();

        if (!Array.isArray(raw)) {
          console.error("Unexpected data format:", raw);
          setError("Failed to load chart data. Please try again.");
          return;
        }

        const categoryData: string[] = [];
        const valueData: number[][] = [];

        raw.forEach((d: CandleData) => {
          categoryData.push(d.Date);
          valueData.push([d.Open, d.Close, d.Low, d.High]);
        });

        setCategories(categoryData);
        setValues(valueData);
      } catch (err) {
        console.error("Error loading candle data", err);
        setError("Error loading chart data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker, interval]);

  if (loading) return <div style={{ color: "#fff" }}>Loading chart...</div>;
  if (error) return <div style={{ color: "#f87171" }}>{error}</div>;

  return (
    <ReactECharts
      style={{ height: "600px", width: "100%" }}
      option={{
        backgroundColor: "#0f172a",
        animation: false,
        textStyle: { color: "#f9fafb" },
        tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
        xAxis: {
          type: "category",
          data: categories,
          scale: true,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "#94a3b8" } },
          splitLine: { show: false },
          min: "dataMin",
          max: "dataMax"
        },
        yAxis: {
          scale: true,
          axisLine: { lineStyle: { color: "#94a3b8" } },
          splitLine: { lineStyle: { color: "#1e293b" } }
        },
        dataZoom: [
          { type: "inside", start: 80, end: 100 },
          {
            show: true,
            type: "slider",
            bottom: 0,
            start: 80,
            end: 100,
            height: 20,
            borderColor: "#334155",
            backgroundColor: "#1e293b",
            fillerColor: "#2563eb80",
            handleStyle: { color: "#2563eb" }
          }
        ],
        series: [
          {
            name: "Candlestick",
            type: "candlestick",
            data: values,
            itemStyle: {
              color: "#22c55e",
              color0: "#ef4444",
              borderColor: "#22c55e",
              borderColor0: "#ef4444"
            }
          }
        ]
      }}
    />
  );
};

export default StockCandleChart;
