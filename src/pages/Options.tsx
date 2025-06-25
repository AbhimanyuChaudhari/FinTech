import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncSelect from "react-select/async";
import type { SingleValue } from "react-select";
import "../styles/Options.css";

import type { OptionEntry } from "../components/optionStratTemplates";
import HedgeAssistant from "../components/HedgeAssistant";
import type { Leg } from "../components/StrategyBuilder";

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
  const [showHedge, setShowHedge] = useState(false);

  const builderRef = useRef<{ addLeg: (leg: Leg) => void }>(null);
  const navigate = useNavigate();

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

  const getDynamicPadding = () => {
    if (showHedge) return "320px";
    return "0";
  };

  return (
    <div className="options-wrapper">
      <div
        className="options-container"
        style={{ paddingRight: getDynamicPadding() }}
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

          <button onClick={() => navigate("/strategy-builder")} className="toggle-builder">
            Open Strategy Builder
          </button>

          <button onClick={() => setShowHedge((prev) => !prev)} className="hedge-button">
            {showHedge ? "Hide Hedge Assistant" : "Hedge My Position"}
          </button>
        </div>

        <div className="legend">
          <span className="itm">● ITM</span>
          <span className="otm">● OTM</span>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
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
        )}
      </div>

      {showHedge && strikePrice && (
        <div className="hedge-panel-fixed">
          <HedgeAssistant symbol={symbol} price={strikePrice} />
        </div>
      )}
    </div>
  );
};

export default OptionsPage;
