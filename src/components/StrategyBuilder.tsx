import { useState, useImperativeHandle, forwardRef } from "react";
import "../styles/StrategyBuilder.css";

export type Leg = {
  action: "Buy" | "Sell";
  type: "Call" | "Put";
  strike: number;
  expiry: string;
  qty: number;
};

interface StrategyBuilderProps {
  expiries: string[];
  strikes: number[];
  currentPrice?: number;
}

const StrategyBuilder = forwardRef(({ expiries, strikes, currentPrice }: StrategyBuilderProps, ref) => {
  const [legs, setLegs] = useState<Leg[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const expiry = expiries[0] || "";
  const price = currentPrice || strikes[Math.floor(strikes.length / 2)] || 0;

  const addLeg = (leg: Leg) => {
    setLegs([...legs, leg]);
  };

  useImperativeHandle(ref, () => ({
    addLeg,
  }));

  const updateLeg = (index: number, key: keyof Leg, value: any) => {
    const updated = [...legs];
    updated[index][key] = value;
    setLegs(updated);
  };

  const removeLeg = (index: number) => {
    setLegs(legs.filter((_, i) => i !== index));
  };

  const exportStrategy = () => {
    const strategy = {
      name: selectedTemplate || "Custom Strategy",
      ticker: "AAPL", // You can pass this later as prop
      legs: legs
    };
    console.log("📤 Exported Strategy:", strategy);
    alert("Strategy exported! Check console.");
  };

  const strategyTemplates: Record<string, () => Leg[]> = {
    "Straddle": () => ([
      { action: "Buy", type: "Call", strike: price, expiry, qty: 1 },
      { action: "Buy", type: "Put", strike: price, expiry, qty: 1 }
    ]),
    "Iron Condor": () => {
      const spread = 5;
      return [
        { action: "Sell", type: "Call", strike: price + spread, expiry, qty: 1 },
        { action: "Buy", type: "Call", strike: price + 2 * spread, expiry, qty: 1 },
        { action: "Sell", type: "Put", strike: price - spread, expiry, qty: 1 },
        { action: "Buy", type: "Put", strike: price - 2 * spread, expiry, qty: 1 }
      ];
    },
    "Bull Call Spread": () => {
      const spread = 5;
      return [
        { action: "Buy", type: "Call", strike: price, expiry, qty: 1 },
        { action: "Sell", type: "Call", strike: price + spread, expiry, qty: 1 }
      ];
    },
    "Bear Put Spread": () => {
      const spread = 5;
      return [
        { action: "Buy", type: "Put", strike: price, expiry, qty: 1 },
        { action: "Sell", type: "Put", strike: price - spread, expiry, qty: 1 }
      ];
    }
  };

  const applyTemplate = (name: string) => {
    const template = strategyTemplates[name];
    if (template) {
      setLegs(template());
    }
  };

  return (
    <div className="strategy-panel">
      <h3>Strategy Builder</h3>

      <div className="template-row">
        <label htmlFor="template">📦 Strategy Template</label>
        <select
          id="template"
          value={selectedTemplate}
          onChange={(e) => {
            setSelectedTemplate(e.target.value);
            applyTemplate(e.target.value);
          }}
        >
          <option value="">Select a strategy…</option>
          {Object.keys(strategyTemplates).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {legs.map((leg, i) => (
        <div key={i} className="leg-row">
          <select
            value={leg.action}
            onChange={(e) => updateLeg(i, "action", e.target.value as "Buy" | "Sell")}
          >
            <option>Buy</option>
            <option>Sell</option>
          </select>

          <select
            value={leg.type}
            onChange={(e) => updateLeg(i, "type", e.target.value as "Call" | "Put")}
          >
            <option>Call</option>
            <option>Put</option>
          </select>

          <select
            value={leg.strike}
            onChange={(e) => updateLeg(i, "strike", Number(e.target.value))}
          >
            {strikes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={leg.expiry}
            onChange={(e) => updateLeg(i, "expiry", e.target.value)}
          >
            {expiries.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          <input
            type="number"
            value={leg.qty}
            min={1}
            onChange={(e) => updateLeg(i, "qty", Number(e.target.value))}
          />

          <button onClick={() => removeLeg(i)}>❌</button>
        </div>
      ))}

      <button onClick={() => addLeg({
        action: "Buy",
        type: "Call",
        strike: price,
        expiry,
        qty: 1
      })} className="add-leg">➕ Add Leg</button>

      <button className="export-button" onClick={exportStrategy}>
        💾 Export Strategy
      </button>

      <div className="strategy-summary">
        <h4>Summary</h4>
        <p>Total Legs: {legs.length}</p>
        <p>📊 P&L Chart Coming Soon</p>
        <p>🔢 Greeks (mock): Δ +0.25 | θ -1.2 | Vega +0.33</p>
      </div>
    </div>
  );
});

export default StrategyBuilder;
