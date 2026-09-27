import type { ICurrency } from "../types/index.ts";

export const CURRENCIES: readonly ICurrency[] = [
  {
    symbol: "BTCUSDT",
    ticker: "BTC",
    name: "Bitcoin",
    badgeTone: "badgeAmber",
  },
  {
    symbol: "ETHUSDT",
    ticker: "ETH",
    name: "Ethereum",
    badgeTone: "badgeViolet",
  },
  {
    symbol: "SOLUSDT",
    ticker: "SOL",
    name: "Solana",
    badgeTone: "badgeEmerald",
  },
  {
    symbol: "BNBUSDT",
    ticker: "BNB",
    name: "BNB",
    badgeTone: "badgeYellow",
  },
  {
    symbol: "XRPUSDT",
    ticker: "XRP",
    name: "XRP",
    badgeTone: "badgeSlate",
  },
];

export const AVAILABLE_CURRENCIES: readonly ICurrency[] = [
  ...CURRENCIES,
  {
    symbol: "ADAUSDT",
    ticker: "ADA",
    name: "Cardano",
    badgeTone: "badgeBlue",
  },
  {
    symbol: "DOGEUSDT",
    ticker: "DOGE",
    name: "Dogecoin",
    badgeTone: "badgeAmber",
  },
  {
    symbol: "LINKUSDT",
    ticker: "LINK",
    name: "Chainlink",
    badgeTone: "badgeBlue",
  },
  {
    symbol: "AVAXUSDT",
    ticker: "AVAX",
    name: "Avalanche",
    badgeTone: "badgeRed",
  },
  {
    symbol: "LTCUSDT",
    ticker: "LTC",
    name: "Litecoin",
    badgeTone: "badgeSlate",
  },
];

export const MARKET_STREAM_URL = `wss://data-stream.binance.vision/stream?streams=${CURRENCIES.map(({ symbol }) => symbol.toLowerCase() + "@miniTicker").join("/")}`;
export const HISTORY_LIMIT = 360;
export const CONNECT_TIMEOUT_MS = 12_000;
export const STALE_TIMEOUT_MS = 30_000;
export const MAX_RETRY_DELAY_MS = 30_000;
export const INITIAL_RETRY_DELAY_MS = 1_000;
