import StockCandleChart from "./StockCandleChart";

interface StockDetailProps {
  ticker: string;
  onClose: () => void;
}

export default function StockDetail({ ticker }: StockDetailProps) {
  return (
    <div style={{ width: "100%", marginTop: "1rem", borderRadius: "8px" }}>
      <StockCandleChart ticker={ticker} />
    </div>
  );
}
