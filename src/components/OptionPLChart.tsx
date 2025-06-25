import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { Leg } from "./optionStratTemplates";

interface Props {
  legs: Leg[];
}

const generatePLData = (legs: Leg[]) => {
  const priceRange = Array.from({ length: 81 }, (_, i) => 60 + i); // $60 to $140
  const data = priceRange.map(price => {
    let totalPL = 0;

    legs.forEach(leg => {
      const multiplier = leg.qty * 100;

      if (leg.type === "Call") {
        const intrinsic = Math.max(0, price - leg.strike);
        const payoff = (leg.action === "Buy" ? 1 : -1) * intrinsic;
        totalPL += payoff * multiplier;
      } else if (leg.type === "Put") {
        const intrinsic = Math.max(0, leg.strike - price);
        const payoff = (leg.action === "Buy" ? 1 : -1) * intrinsic;
        totalPL += payoff * multiplier;
      }
    });

    return { price, profit: totalPL };
  });

  return data;
};

const OptionPLChart: React.FC<Props> = ({ legs }) => {
  if (legs.length === 0) return null;

  const data = generatePLData(legs);

  return (
    <div className="pl-chart">
      <h3>Profit / Loss at Expiry</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="price" label={{ value: "Spot Price", position: "insideBottom", offset: -5 }} />
          <YAxis label={{ value: "Profit ($)", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <ReferenceLine y={0} stroke="#888" />
          <Line type="monotone" dataKey="profit" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OptionPLChart;
