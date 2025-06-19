import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Strategy {
  name: string;
  description: string;
}

interface StrategyGroup {
  title: string;
  strategies: Strategy[];
}

export default function StrategyTestingPage() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const strategyGroups: StrategyGroup[] = [
    {
      title: "Trend Indicators",
      strategies: [
        { name: "SMA", description: "Simple Moving Average" },
        { name: "EMA", description: "Exponential Moving Average" },
        { name: "MACD", description: "Moving Average Convergence Divergence" },
        { name: "ADX", description: "Average Directional Index" },
        { name: "Ichimoku", description: "Ichimoku Cloud System" },
        { name: "Parabolic SAR", description: "Stop and Reverse system" },
      ],
    },
    {
      title: "Momentum Indicators",
      strategies: [
        { name: "RSI", description: "Relative Strength Index (0–100)" },
        { name: "Stochastic Oscillator", description: "Compares close price to range" },
        { name: "CCI", description: "Commodity Channel Index" },
        { name: "ROC", description: "Rate of Change" },
        { name: "Momentum", description: "Measures the change in price" },
      ],
    },
    {
      title: "Volatility Indicators",
      strategies: [
        { name: "Bollinger Bands", description: "Bands based on SMA and standard deviation" },
        { name: "ATR", description: "Average True Range" },
        { name: "Keltner Channels", description: "Based on EMA + ATR" },
        { name: "Donchian Channels", description: "High/low bands over a period" },
      ],
    },
    {
      title: "Volume-Based Indicators",
      strategies: [
        { name: "OBV", description: "On-Balance Volume" },
        { name: "CMF", description: "Chaikin Money Flow" },
        { name: "VWAP", description: "Volume-Weighted Average Price" },
        { name: "MFI", description: "Money Flow Index (volume + RSI)" },
        { name: "Accum/Distrib Line", description: "Trend using price-volume flow" },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a", color: "#f9fafb" }}>
      {/* Sidebar */}
      <div style={{ width: "220px", padding: "2rem 1rem", background: "#1e293b", borderRight: "1px solid #334155" }}>
        {strategyGroups.map((group) => (
          <div
            key={group.title}
            onClick={() => setSelectedGroup(group.title)}
            style={{
              padding: "0.75rem 1rem",
              marginBottom: "0.5rem",
              borderRadius: "6px",
              backgroundColor: selectedGroup === group.title ? "#2563eb" : "transparent",
              color: selectedGroup === group.title ? "#fff" : "#cbd5e1",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {group.title}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>
          Strategy Testing for {ticker}
        </h1>

        {selectedGroup && (
          <>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{selectedGroup}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {strategyGroups.find((g) => g.title === selectedGroup)?.strategies.map((strategy) => (
                <div
                  key={strategy.name}
                  onClick={() =>
                    navigate(`/strategy/${ticker}/${strategy.name.toLowerCase().replace(/\s+/g, "-")}`)
                  }
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "background 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1c2e4a")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0f172a")}
                >
                  <strong>{strategy.name}</strong> — <span style={{ color: "#94a3b8" }}>{strategy.description}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
