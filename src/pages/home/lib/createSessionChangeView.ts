import type { ICurrencyQuote } from '../../../entities/currency'
import type { ISessionChangeViewState } from '../model/types/sessionChange'
import { formatPrice } from './formatPrice'

export function createSessionChangeView(quote: ICurrencyQuote | undefined): ISessionChangeViewState {
  if (!quote) return { isUnavailable: true, color: 'neutralSoft', direction: 'unchanged', label: '', title: '' }
  const change = quote.percentageChange;
  const formatted =
    change !== 0 && Math.abs(change) < 0.0001
      ? `${change > 0 ? "+" : "-"}<0.0001`
      : new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: Math.abs(change) < 0.01 ? 4 : 2,
          signDisplay: "exceptZero",
        }).format(change);
  const color =
    change > 0 ? "positiveSoft" : change < 0 ? "negativeSoft" : "neutralSoft";

  return { isUnavailable: false, color, direction: change > 0 ? 'up' : change < 0 ? 'down' : 'unchanged', label: `${formatted}%`, title: `Since the first session price of ${formatPrice(quote.initialPrice)} USDT` }
}
