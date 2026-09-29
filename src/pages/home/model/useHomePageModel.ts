import { useSignificantAlerts } from '../../../features/significant-alerts'
import { useTargetAlerts } from '../../../features/target-alerts'
import { usePriceToasts } from './usePriceToasts'

export function useHomePageModel() {
  const session = useSignificantAlerts()
  const targets = useTargetAlerts()
  usePriceToasts(session.alerts, targets.alerts)
  return { session, targets }
}
