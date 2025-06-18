import { useEffect, useState } from "react";

export const usePrice = (ticker: string, initialPrice: number | null = null) => {
  const [price, setPrice] = useState<number | null>(initialPrice);

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
    const interval = setInterval(fetchPrice, 10000);

    return () => clearInterval(interval);
  }, [ticker]);

  return price;
};
