import { useState } from "react";
import "../styles/HedgeAssistant.css";
import axios from "axios";

type RiskLevel = "Low" | "Medium" | "High";

interface Props {
  symbol: string;
  price: number;
}

interface HedgeSuggestion {
  strategy: string;
  strike: number;
  expiry: string;
  cost: number;
}

const HedgeAssistant: React.FC<Props> = ({ symbol, price }) => {
  const [shares, setShares] = useState(100);
  const [risk, setRisk] = useState<RiskLevel>("Medium");
  const [suggestion, setSuggestion] = useState<HedgeSuggestion | null>(null);

  const handleGenerate = async () => {
    try {
      const res = await axios.post("/api/hedge", {
        ticker: symbol,
        shares,
        risk_level: risk,
        price
      });
      setSuggestion(res.data);
    } catch (error) {
      console.error("❌ Error generating hedge:", error);
      alert("Failed to fetch hedge strategy.");
    }
  };

  return (
    <div className="hedge-panel">
      <h3>🛡️ Hedge Assistant</h3>

      <div className="hedge-form">
        <label>Shares Held</label>
        <input type="number" value={shares} onChange={(e) => setShares(Number(e.target.value))} />

        <label>Risk Level</label>
        <select value={risk} onChange={(e) => setRisk(e.target.value as RiskLevel)}>
          <option value="High">High (Tight Hedge)</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low (Cheaper Hedge)</option>
        </select>

        <button onClick={handleGenerate}>Generate Hedge</button>
      </div>

      {suggestion && (
        <div className="hedge-output">
          <h4>📦 Strategy: {suggestion.strategy}</h4>
          <p>Buy 1 Put @ <strong>{suggestion.strike}</strong> expiring <strong>{suggestion.expiry}</strong></p>
          <p>Estimated Cost: <strong>${suggestion.cost}</strong></p>
        </div>
      )}
    </div>
  );
};

export default HedgeAssistant;
