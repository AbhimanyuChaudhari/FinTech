import { useEffect, useState } from "react";

export type SectorMap = Record<string, string[]>;

export const useStockDashboard = () => {
  const [sectorMap, setSectorMap] = useState<SectorMap>({});
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/sector_tickers.json")
      .then((res) => res.json())
      .then((data: SectorMap) => {
        setSectorMap(data);
        setSelectedSector(Object.keys(data)[0] || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load sector tickers:", err);
        setLoading(false);
      });
  }, []);

  return {
    sectorMap,
    selectedSector,
    setSelectedSector,
    loading,
  };
};
