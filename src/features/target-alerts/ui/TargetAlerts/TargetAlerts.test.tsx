import { expect, jest, test } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CURRENCIES } from '../../../../entities/currency'
import type { IMarketSnapshot } from '../../../../entities/currency'
import { TargetAlerts } from './TargetAlerts'

const market: IMarketSnapshot = {
  status: 'connected',
  quotes: {},
  history: {},
  message: null,
  retryAt: null,
}

test('should create and manage alerts through the form and alert row', async () => {
  const user = userEvent.setup()
  const onAdd = jest.fn()
  const onRearm = jest.fn()
  const onRemove = jest.fn()
  const { rerender } = render(
    <TargetAlerts
      currencies={CURRENCIES}
      market={market}
      alerts={[]}
      onAdd={onAdd}
      onRearm={onRearm}
      onRemove={onRemove}
    />,
  )
  expect(screen.getByText('No target alerts yet.')).toBeInTheDocument()

  await user.type(screen.getByRole('textbox', { name: 'Target price (USDT)' }), '120')
  await user.click(screen.getByRole('button', { name: 'Create alert' }))
  expect(onAdd).toHaveBeenCalledTimes(1)
  expect(onAdd.mock.calls[0]?.[0]).toMatchObject({
    symbol: 'BTCUSDT',
    target: 120,
    direction: 'above',
  })
  expect(screen.getByRole('textbox', { name: 'Target price (USDT)' })).toHaveValue('')

  rerender(
    <TargetAlerts
      currencies={CURRENCIES}
      market={market}
      alerts={[{ id: 'test-alert-id', symbol: 'BTCUSDT', target: 120, direction: 'above', triggeredPrice: 121 }]}
      onAdd={onAdd}
      onRearm={onRearm}
      onRemove={onRemove}
    />,
  )
  expect(screen.getByRole('status')).toHaveTextContent('Triggered at 121 USDT')
  await user.click(screen.getByRole('button', { name: 'Rearm BTC alert' }))
  await user.click(screen.getByRole('button', { name: 'Remove BTC alert' }))
  expect(onRearm).toHaveBeenCalledWith('test-alert-id')
  expect(onRemove).toHaveBeenCalledWith('test-alert-id')
})
