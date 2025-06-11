// src/hooks/usePrice.ts
import { useEffect, useState } from "react";

export const usePrice = (ticker: string) => {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/price/${ticker}`);
        const data = await res.json();
        if (data.close) {
          setPrice(data.close);
        }
      } catch (err) {
        console.error("Failed to fetch price:", err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000); // refresh every 10 sec

    return () => clearInterval(interval);
  }, [ticker]);

  return price;
};
