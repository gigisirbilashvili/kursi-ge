import { useEffect, useState } from 'react'

import type { ICurrency } from '../../../entities/currency/index.ts'
import { useMarketQuote, useMarketStatus } from '../../../entities/currency'
import { useSampledValue } from '../../../shared/lib/useSampledValue'
import { notify } from '../../../shared/lib/notify'
import { getConversionResult } from '../lib/convertCurrency.ts'

export function useConversionCalculator(available: readonly ICurrency[]) {
  const [amount, setAmount] = useState('1')
  const [currencies, setCurrencies] = useState({ source: 'BTCUSDT', target: 'ETHUSDT' })
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const setSource = (source: string) => setCurrencies((current) => ({ ...current, source }))
  const setTarget = (target: string) => setCurrencies((current) => ({ ...current, target }))
  const source = available.some(({ symbol }) => symbol === currencies.source)
    ? currencies.source
    : (available[0]?.symbol ?? '')
  const target = available.some(({ symbol }) => symbol === currencies.target)
    ? currencies.target
    : (available[1]?.symbol ?? source)
  const swap = () => setCurrencies({ source: target, target: source })
  const status = useMarketStatus()
  const sourceQuote = useMarketQuote(source)
  const targetQuote = useMarketQuote(target)
  const liveResult = getConversionResult(amount, source, target, {
    status, quotes: { [source]: sourceQuote, [target]: targetQuote },
    history: {}, message: null, retryAt: null,
  }, now)
  const sampledResult = useSampledValue(
    liveResult,
    30_000,
    `${source}/${target}/${amount}/${status}`,
    liveResult.status === 'ready',
  )
  const result = liveResult.status === 'ready' ? sampledResult : liveResult
  const staleMessage = result.status === 'stale' && status === 'connected' ? result.message : null

  useEffect(() => {
    if (staleMessage) notify.warning(staleMessage, { toastId: 'conversion-stale' })
    else notify.dismiss('conversion-stale')
  }, [staleMessage])

  return { amount, setAmount, source, target, setSource, setTarget, swap, result }
}
