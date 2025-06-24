// src/types/optionTypes.ts
export type OptionEntry = {
  type: "call" | "put";
  symbol: string;
  expiry: string;
  strike: number;
  bid: number;
  ask: number;
  iv: number | null;
  volume: number | null;
  openInterest: number;
};
