import type { ICurrency } from '../../../entities/currency'
import { notify } from '../../../shared/lib/notify'
import { formatConversionValue } from '../lib/convertCurrency'
import type { IConversionCalculatorViewState } from './types/conversionCalculator'
import { useConversionCalculator } from './useConversionCalculator'

export function useConversionCalculatorModel(currencies: readonly ICurrency[]): IConversionCalculatorViewState {
  const { amount, setAmount, source, target, setSource, setTarget, swap, result } = useConversionCalculator(currencies)
  const sourceTicker = currencies.find(({ symbol }) => symbol === source)?.ticker ?? source
  const targetTicker = currencies.find(({ symbol }) => symbol === target)?.ticker ?? target
  const hasError = result.status === 'invalid'
  return {
    amount, source, target, sourceTicker,
    currencyOptions: currencies.map(({ symbol, ticker, name }) => ({ value: symbol, label: `${ticker} - ${name}` })),
    hasError,
    helperText: hasError ? result.message : 'Enter zero or a positive amount.',
    isReady: result.status === 'ready',
    isWaiting: result.status === 'waiting',
    isStale: result.status === 'stale',
    resultText: result.status === 'ready' ? `${formatConversionValue(result.value)} ${targetTicker}` : '',
    rateText: result.status === 'ready' ? `1 ${sourceTicker} ≈ ${formatConversionValue(result.rate)} ${targetTicker}` : '',
    statusText: result.status === 'ready' ? '' : result.status === 'invalid' ? 'Correct the amount to see the conversion.' : result.message,
    onAmountChange: setAmount, onSourceChange: setSource, onTargetChange: setTarget, onSwap: swap,
    onAmountBlur: () => { if (hasError) notify.error(result.message, { toastId: 'conversion-invalid' }) },
  }
}
