import React from "react";
import type { Leg } from "./optionStratTemplates";

interface Props {
  legs: Leg[];
  setLegs: (legs: Leg[]) => void;
}

const OptionLegTable: React.FC<Props> = ({ legs, setLegs }) => {
  const handleChange = (index: number, field: keyof Leg, value: any) => {
    const updated = [...legs];
    updated[index][field] = field === "strike" || field === "qty" ? parseFloat(value) : value;
    setLegs(updated);
  };

  return (
    <div className="leg-table-wrapper">
      <h3 className="card-title">Legs</h3>
      <table className="leg-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Type</th>
            <th>Strike</th>
            <th>Expiry</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {legs.map((leg, idx) => (
            <tr key={idx}>
              <td>
                <select
                  value={leg.action}
                  onChange={(e) => handleChange(idx, "action", e.target.value)}
                  className={leg.action === "Buy" ? "buy-cell" : "sell-cell"}
                >
                  <option>Buy</option>
                  <option>Sell</option>
                </select>
              </td>
              <td>
                <select
                  value={leg.type}
                  onChange={(e) => handleChange(idx, "type", e.target.value)}
                >
                  <option>Call</option>
                  <option>Put</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={leg.strike}
                  onChange={(e) => handleChange(idx, "strike", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={leg.expiry}
                  onChange={(e) => handleChange(idx, "expiry", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={leg.qty}
                  onChange={(e) => handleChange(idx, "qty", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OptionLegTable;
