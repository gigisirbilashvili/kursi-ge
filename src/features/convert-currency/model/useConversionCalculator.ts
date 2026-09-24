import { useEffect, useState } from 'react'

import type { IMarketSnapshot } from '../../../entities/currency/index.ts'
import { getConversionResult } from '../lib/convertCurrency.ts'

export function useConversionCalculator(market: IMarketSnapshot) {
  const [amount, setAmount] = useState('1')
  const [currencies, setCurrencies] = useState({ source: 'BTCUSDT', target: 'ETHUSDT' })
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const setSource = (source: string) => setCurrencies((current) => ({ ...current, source }))
  const setTarget = (target: string) => setCurrencies((current) => ({ ...current, target }))
  const swap = () =>
    setCurrencies((current) => ({ source: current.target, target: current.source }))
  const result = getConversionResult(amount, currencies.source, currencies.target, market, now)

  return { amount, setAmount, ...currencies, setSource, setTarget, swap, result }
}
