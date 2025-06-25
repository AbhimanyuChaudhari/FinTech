import React from "react";
import type { Leg } from "./optionStratTemplates";

interface Props {
  legs: Leg[];
}

// Placeholder prices for now (in a real app you'd fetch from API)
const getPrice = (leg: Leg): number => {
  if (leg.type === "Call") {
    return leg.action === "Buy" ? 2 : 1.5;
  } else {
    return leg.action === "Buy" ? 2.5 : 2;
  }
};

const OptionStrategySummary: React.FC<Props> = ({ legs }) => {
  if (legs.length === 0) return null;

  let netDebit = 0;

  legs.forEach((leg) => {
    const price = getPrice(leg);
    const multiplier = leg.qty * 100;
    netDebit += (leg.action === "Buy" ? -1 : 1) * price * multiplier;
  });

  return (
    <div className="strategy-summary">
      <h3>Strategy Summary</h3>
      <ul>
        <li><strong>Net Cost:</strong> ${Math.abs(netDebit).toFixed(2)} {netDebit < 0 ? "(Debit)" : "(Credit)"}</li>
        <li><strong>Max Profit:</strong> — (based on payoff logic)</li>
        <li><strong>Max Loss:</strong> — (based on payoff logic)</li>
        <li><strong>Breakeven:</strong> — (estimated manually)</li>
      </ul>
    </div>
  );
};

export default OptionStrategySummary;
