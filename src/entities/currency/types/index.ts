export type TMarketStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";
export type TPriceDirection = "up" | "down" | "unchanged";

export interface ICurrency {
  symbol: string;
  ticker: string;
  name: string;
  badgeTone:
    | "badgeAmber"
    | "badgeViolet"
    | "badgeEmerald"
    | "badgeYellow"
    | "badgeSlate"
    | "badgeBlue"
    | "badgeRed";
}

export interface IMarketTick {
  symbol: string;
  price: number;
  eventTime: number;
}

export type TMarketSocketData = string | Blob | ArrayBuffer;

export interface IBinanceData {
  e: string;
  s: string;
  c: string;
  E: number;
}

export interface IBinanceEnvelope {
  id?: number | null;
  result?: null;
  stream?: string;
  data?: Partial<IBinanceData>;
}

export type TParsedMarketMessage =
  | { kind: "ticker"; tick: IMarketTick }
  | { kind: "subscription"; id: number | null; isAccepted: boolean }
  | { kind: "invalid"; message: string };

export interface ICurrencyQuote {
  initialPrice: number;
  previousPrice: number;
  price: number;
  direction: TPriceDirection;
  percentageChange: number;
  eventTime: number;
  receivedAt: number;
}

export interface IMarketSnapshot {
  history: Readonly<Record<string, readonly IPricePoint[]>>;
  status: TMarketStatus;
  quotes: Readonly<Record<string, ICurrencyQuote>>;
  message: string | null;
  retryAt: number | null;
}

export interface IMarketSocket {
  send: (message: string) => void;
  onopen: (() => void) | null;
  onmessage: ((data: TMarketSocketData) => void) | null;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
  close: () => void;
}

export interface IMarketFeedOptions {
  streamEndpoint: string;
  symbols?: readonly string[];
  createSocket?: (url: string) => IMarketSocket;
  now?: () => number;
  schedule?: (
    callback: () => void,
    delay: number,
  ) => ReturnType<typeof setTimeout>;
  cancel?: (timer: ReturnType<typeof setTimeout>) => void;
}

export interface IPricePoint {
  time: number;
  price: number;
}
