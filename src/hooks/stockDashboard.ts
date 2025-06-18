import { useEffect, useState } from "react";

export interface TickerMetadata {
  ticker: string;
  name: string;
  exchange: string;
}

export type SectorMap = Record<string, TickerMetadata[]>;

export const useStockDashboard = () => {
  const [sectorMap, setSectorMap] = useState<SectorMap>({});
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/sectors");
        const data: SectorMap = await res.json();
        setSectorMap(data);
        setSelectedSector(Object.keys(data)[0] || "");
      } catch (err) {
        console.error("Failed to load sector data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    sectorMap,
    selectedSector,
    setSelectedSector,
    loading,
  };
};
