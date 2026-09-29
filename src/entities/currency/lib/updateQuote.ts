import type { ICurrencyQuote, IMarketTick } from "../types/index.ts";

export function updateQuote(
  previous: ICurrencyQuote | undefined,
  tick: IMarketTick,
  receivedAt: number,
): ICurrencyQuote {
  const initialPrice = previous?.initialPrice ?? tick.price;
  const previousPrice = previous?.price ?? tick.price;

  let direction: ICurrencyQuote["direction"] = "unchanged";

  if (tick.price > previousPrice) {
    direction = "up";
  } else if (tick.price < previousPrice) {
    direction = "down";
  }

  return {
    initialPrice,
    previousPrice,
    price: tick.price,
    direction,
    percentageChange: ((tick.price - initialPrice) / initialPrice) * 100,
    eventTime: tick.eventTime,
    receivedAt,
  };
}
