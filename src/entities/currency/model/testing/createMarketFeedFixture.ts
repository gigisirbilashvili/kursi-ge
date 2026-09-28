import type { IMarketSnapshot } from '../../types'
import { createMarketFeed } from '../createMarketFeed'

export function createMarketFeedFixture(initial: IMarketSnapshot) {
  let snapshot = initial
  const listeners = new Set<() => void>()
  const feed = {
    ...createMarketFeed({ streamEndpoint: 'test-endpoint' }),
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
  return {
    feed,
    publish(next: IMarketSnapshot) {
      snapshot = next
      listeners.forEach((listener) => listener())
    },
  }
}
