import { useEffect, useRef } from 'react'

import { notify } from '../../../shared/lib/notify'
import type { IMarketSnapshot, TMarketStatus } from '../types'

export function useMarketNotifications({ status, message }: IMarketSnapshot) {
  const previousStatus = useRef<TMarketStatus | null>(null)
  const hasFailed = useRef(false)

  useEffect(() => {
    if (previousStatus.current === status) return
    previousStatus.current = status
    if (status === 'connected') {
      notify.dismiss('market-connection')
      if (hasFailed.current) notify.success('Live market prices are connected again.', { toastId: 'market-restored' })
      hasFailed.current = false
    } else if (status === 'error' || status === 'disconnected' || status === 'reconnecting') {
      hasFailed.current = true
      notify.error(message ?? 'Live prices are unavailable. Please check your connection and retry.', {
        toastId: 'market-connection',
      })
    }
  }, [status, message])
}
