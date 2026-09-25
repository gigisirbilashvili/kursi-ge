import { useEffect, useEffectEvent, useState } from 'react'

export function useSampledValue<T>(value: T, intervalMs: number, key: string, isReady: boolean) {
  const [sample, setSample] = useState({ value, key, isReady })

  if (sample.key !== key || (isReady && !sample.isReady)) {
    setSample({ value, key, isReady })
  }

  const refresh = useEffectEvent(() => {
    setSample({ value, key, isReady })
  })

  useEffect(() => {
    const timer = window.setInterval(() => refresh(), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs, key, sample.isReady])

  return sample.value
}
