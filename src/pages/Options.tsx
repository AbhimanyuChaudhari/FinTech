import { useEffect, useRef, useState } from "react";
import axios from "axios";
import AsyncSelect from "react-select/async";
import type { SingleValue } from "react-select";
import "../styles/Options.css";

import type { OptionEntry } from "../types/optionTypes";
import StrategyBuilder, { Leg } from "../components/StrategyBuilder";
import HedgeAssistant from "../components/HedgeAssistant";

type SearchOption = {
  label: string;
  value: string;
};

const OptionsPage = () => {
  const [symbol, setSymbol] = useState("AAPL");
  const [options, setOptions] = useState<OptionEntry[]>([]);
  const [strikePrice, setStrikePrice] = useState<number | null>(null);
  const [expiries, setExpiries] = useState<string[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SingleValue<SearchOption>>(null);
  const [showBuilder, setShowBuilder] = useState(true);

  const builderRef = useRef<{ addLeg: (leg: Leg) => void }>(null);

  const fetchOptions = async (ticker: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/options/${ticker}`);
      const { data, price } = res.data;

      if (!Array.isArray(data)) {
        console.error("Invalid data:", res.data);
        return;
      }

      const uniqueExpiries = [...new Set(data.map((d: any) => d.expiry))] as string[];
      setOptions(data);
      setStrikePrice(price);
      setExpiries(uniqueExpiries);
      setSelectedExpiry(uniqueExpiries[0] || "");
    } catch (err) {
      console.error("❌ Error fetching options:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions(symbol);
  }, [symbol]);

  const loadOptions = async (inputValue: string): Promise<SearchOption[]> => {
    try {
      const res = await axios.get(`/api/search?query=${inputValue}`);
      return res.data.map((item: any) => ({
        label: `${item.ticker} - ${item.name}`,
        value: item.ticker
      }));
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  };

  const calls = options.filter(opt => opt.type === "call" && opt.expiry === selectedExpiry);
  const puts = options.filter(opt => opt.type === "put" && opt.expiry === selectedExpiry);
  const strikes = Array.from(new Set([...calls, ...puts].map(opt => opt.strike))).sort((a, b) => a - b);

  const getRowClass = (type: string, strike: number): string => {
    if (strikePrice == null) return "";
    if (type === "call" && strike < strikePrice) return "itm";
    if (type === "put" && strike > strikePrice) return "itm";
    return "otm";
  };

  return (
    <div className="options-wrapper">
      <div
        className="options-container"
        style={{ paddingRight: showBuilder ? "370px" : "0" }}
      >
        <h2>Options Chain</h2>

        <div className="controls">
          <label>Ticker:</label>
          <AsyncSelect<SearchOption>
            loadOptions={loadOptions}
            value={selectedOption}
            onChange={(option) => {
              if (option) {
                setSelectedOption(option);
                setSymbol(option.value.toUpperCase());
              }
            }}
            placeholder="Search by name or ticker…"
            isClearable
            className="ticker-select"
          />

          <label>Expiry:</label>
          <select
            value={selectedExpiry}
            onChange={(e) => setSelectedExpiry(e.target.value)}
          >
            {expiries.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          <button onClick={() => setShowBuilder((prev) => !prev)} className="toggle-builder">
            {showBuilder ? "Hide" : "Show"} Strategy Builder
          </button>
        </div>

        <div className="legend">
          <span className="itm">● ITM</span>
          <span className="otm">● OTM</span>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table className="options-table">
              <thead>
                <tr>
                  <th colSpan={5}>Calls</th>
                  <th>Strike</th>
                  <th colSpan={5}>Puts</th>
                </tr>
                <tr>
                  <th>Bid</th>
                  <th>Ask</th>
                  <th>IV</th>
                  <th>Vol</th>
                  <th>OI</th>
                  <th></th>
                  <th>Bid</th>
                  <th>Ask</th>
                  <th>IV</th>
                  <th>Vol</th>
                  <th>OI</th>
                </tr>
              </thead>
              <tbody>
                {strikes.map((strike) => {
                  const call = calls.find(c => c.strike === strike);
                  const put = puts.find(p => p.strike === strike);
                  return (
                    <tr key={strike}>
                      <td
                        className={call ? getRowClass("call", strike) : ""}
                        onClick={() =>
                          call &&
                          builderRef.current?.addLeg({
                            action: "Buy",
                            type: "Call",
                            strike,
                            expiry: selectedExpiry,
                            qty: 1
                          })
                        }
                      >
                        {call?.bid ?? "-"}
                      </td>
                      <td className={call ? getRowClass("call", strike) : ""}>{call?.ask ?? "-"}</td>
                      <td className={call ? getRowClass("call", strike) : ""}>{call?.iv?.toFixed(2) ?? "-"}</td>
                      <td className={call ? getRowClass("call", strike) : ""}>{call?.volume ?? "-"}</td>
                      <td className={call ? getRowClass("call", strike) : ""}>{call?.openInterest ?? "-"}</td>
                      <td className="strike">{strike}</td>
                      <td
                        className={put ? getRowClass("put", strike) : ""}
                        onClick={() =>
                          put &&
                          builderRef.current?.addLeg({
                            action: "Buy",
                            type: "Put",
                            strike,
                            expiry: selectedExpiry,
                            qty: 1
                          })
                        }
                      >
                        {put?.bid ?? "-"}
                      </td>
                      <td className={put ? getRowClass("put", strike) : ""}>{put?.ask ?? "-"}</td>
                      <td className={put ? getRowClass("put", strike) : ""}>{put?.iv?.toFixed(2) ?? "-"}</td>
                      <td className={put ? getRowClass("put", strike) : ""}>{put?.volume ?? "-"}</td>
                      <td className={put ? getRowClass("put", strike) : ""}>{put?.openInterest ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* 🔽 Hedge Assistant inserted below the table */}
            {strikePrice && <HedgeAssistant symbol={symbol} price={strikePrice} />}
          </>
        )}
      </div>

      {showBuilder && (
        <div className="strategy-panel-fixed">
          <StrategyBuilder ref={builderRef} expiries={expiries} strikes={strikes} />
        </div>
      )}
    </div>
  );
};

export default OptionsPage;
