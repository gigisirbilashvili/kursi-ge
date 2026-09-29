import { useState } from 'react'

import { notify } from '../../../shared/lib/notify'
import { isTargetAlertLimitReached, parseTarget, validateTargetSubmission } from '../lib/createTargetAlerts'
import type { ITargetAlertsProps } from '../ui/TargetAlerts/types'
import type { ITargetAlertFormProps } from '../ui/TargetAlertForm/types'

export function useTargetAlertForm({ currencies, alerts, onAdd }: ITargetAlertsProps): ITargetAlertFormProps {
  const isFull = isTargetAlertLimitReached(alerts.length)
  const [selection, setSelection] = useState('BTCUSDT')
  const [direction, setDirection] = useState<'above' | 'below'>('above')
  const [target, setTarget] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const symbol = currencies.some((currency) => currency.symbol === selection)
    ? selection
    : (currencies[0]?.symbol ?? '')
  const price = parseTarget(target)
  const hasError = (hasSubmitted || target.length > 0) && price === null
  const currencyOptions = currencies.map(({ symbol: value, ticker }) => ({
    value,
    label: `${ticker}/USDT`,
  }))

  const onSubmit = () => {
    setHasSubmitted(true)
    const result = validateTargetSubmission(target, alerts.length)
    if (!result.isValid) {
      notify.error(result.message, { toastId: result.toastId })
      return
    }
    onAdd({ id: crypto.randomUUID(), symbol, target: result.price, direction })
    setTarget('')
    setHasSubmitted(false)
  }
  return {
    symbol, direction, target, hasError, isFull, currencyOptions,
    helperText: hasError ? 'Enter a positive decimal price.' : undefined,
    onSymbolChange: setSelection,
    onDirectionChange: (value) => setDirection(value === 'above' ? 'above' : 'below'),
    onTargetChange: setTarget, onSubmit,
  }
}
