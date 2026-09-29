import { useEffect, useState } from 'react'

import { useMarketStatus, useMarketValue } from '../../../entities/currency'

export function useMarketPanelFooterModel() {
  const [now, setNow] = useState(Date.now)
  const status = useMarketStatus()
  const latestUpdate = useMarketValue((snapshot) =>
    Math.max(0, ...Object.values(snapshot.quotes).map(({ receivedAt }) => receivedAt)))
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const age = latestUpdate ? Math.max(0, Math.floor((now - latestUpdate) / 1000)) : null
  const isWaiting = !latestUpdate && (status === 'connecting' || status === 'reconnecting')

  return { updateText: age === null ? isWaiting ? 'Waiting for market data' : 'No prices received' : `Last update ${age < 2 ? 'just now' : `${age}s ago`}` }
}
