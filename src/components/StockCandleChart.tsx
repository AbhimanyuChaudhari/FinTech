import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const StockCandleChart = ({ ticker }: { ticker: string }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [values, setValues] = useState<number[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/ohlc/${ticker}`);
        const raw: CandleData[] = await res.json();

        const categoryData: string[] = [];
        const valueData: number[][] = [];

        raw.forEach(d => {
          categoryData.push(d.time);
          valueData.push([d.open, d.close, d.low, d.high]); // ECharts expects [open, close, low, high]
        });

        setCategories(categoryData);
        setValues(valueData);
      } catch (err) {
        console.error("Error loading candle data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker]);

  if (loading) return <div style={{ color: "#fff" }}>Loading chart...</div>;

  return (
    <ReactECharts
      style={{ height: "600px", width: "100%" }}
      option={{
        backgroundColor: "#0f172a",
        animation: false,
        textStyle: { color: "#f9fafb" },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          }
        },
        toolbox: {
          feature: {
            dataZoom: { yAxisIndex: "none" },
            restore: {},
            saveAsImage: {}
          }
        },
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
          {
            type: "inside",
            start: 80,
            end: 100
          },
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
            handleSize: "100%",
            handleStyle: {
              color: "#2563eb"
            }
          }
        ],
        series: [
          {
            name: "Candlestick",
            type: "candlestick",
            data: values,
            itemStyle: {
              color: "#22c55e",       // Green for up
              color0: "#ef4444",      // Red for down
              borderColor: "#22c55e",
              borderColor0: "#ef4444"
            },
          }
        ]
      }}
    />
  );
};

export default StockCandleChart;
