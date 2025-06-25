export type Leg = {
  action: "Buy" | "Sell";
  type: "Call" | "Put";
  strike: number;
  expiry: string;
  qty: number;
};

export type OptionStratTemplate = {
  name: string;
  legs: Leg[];
};

// Dummy expiry to be replaced dynamically in the UI
const EXPIRY = "2025-07-19";

export const optionStratTemplates: OptionStratTemplate[] = [
  {
    name: "Bull Call Spread",
    legs: [
      { action: "Buy", type: "Call", strike: 100, expiry: EXPIRY, qty: 1 },
      { action: "Sell", type: "Call", strike: 110, expiry: EXPIRY, qty: 1 }
    ]
  },
  {
    name: "Bear Put Spread",
    legs: [
      { action: "Buy", type: "Put", strike: 110, expiry: EXPIRY, qty: 1 },
      { action: "Sell", type: "Put", strike: 100, expiry: EXPIRY, qty: 1 }
    ]
  },
  {
    name: "Straddle",
    legs: [
      { action: "Buy", type: "Call", strike: 105, expiry: EXPIRY, qty: 1 },
      { action: "Buy", type: "Put", strike: 105, expiry: EXPIRY, qty: 1 }
    ]
  },
  {
    name: "Strangle",
    legs: [
      { action: "Buy", type: "Call", strike: 110, expiry: EXPIRY, qty: 1 },
      { action: "Buy", type: "Put", strike: 100, expiry: EXPIRY, qty: 1 }
    ]
  },
  {
    name: "Iron Condor",
    legs: [
      { action: "Sell", type: "Call", strike: 110, expiry: EXPIRY, qty: 1 },
      { action: "Buy", type: "Call", strike: 115, expiry: EXPIRY, qty: 1 },
      { action: "Sell", type: "Put", strike: 100, expiry: EXPIRY, qty: 1 },
      { action: "Buy", type: "Put", strike: 95, expiry: EXPIRY, qty: 1 }
    ]
  },
  {
    name: "Covered Call",
    legs: [
      { action: "Sell", type: "Call", strike: 110, expiry: EXPIRY, qty: 1 }
      // Stock holding implied, not listed here
    ]
  },
  {
    name: "Protective Put",
    legs: [
      { action: "Buy", type: "Put", strike: 100, expiry: EXPIRY, qty: 1 }
      // Stock holding implied, not listed here
    ]
  }
];
