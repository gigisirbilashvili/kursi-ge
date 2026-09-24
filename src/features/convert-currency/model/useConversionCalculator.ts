import { useEffect, useState } from 'react'

import type { ICurrency, IMarketSnapshot } from '../../../entities/currency/index.ts'
import { getConversionResult } from '../lib/convertCurrency.ts'

export function useConversionCalculator(market: IMarketSnapshot, available: readonly ICurrency[]) {
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
  const result = getConversionResult(amount, source, target, market, now)

  return { amount, setAmount, source, target, setSource, setTarget, swap, result }
}
