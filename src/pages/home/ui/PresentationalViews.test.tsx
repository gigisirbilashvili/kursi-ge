import { afterEach, expect, jest, test } from '@jest/globals'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

import { TargetAlertForm } from '../../../features/target-alerts/ui/TargetAlertForm/TargetAlertForm'
import { TargetAlertItem } from '../../../features/target-alerts/ui/TargetAlertItem/TargetAlertItem'
import { MarketCurrencyActions } from './MarketCurrencyActions/MarketCurrencyActions'
import { MarketAlerts } from './MarketAlerts/MarketAlerts'

afterEach(cleanup)

test('should forward target submission without parsing the input or creating an alert', () => {
  const onSubmit = jest.fn()
  render(<TargetAlertForm
    symbol="test" direction="above" target="unparsed input" hasError={false} isFull={false}
    currencyOptions={[{ value: 'test', label: 'Test' }]} helperText="Prepared help"
    onSymbolChange={jest.fn()} onDirectionChange={jest.fn()} onTargetChange={jest.fn()} onSubmit={onSubmit}
  />)
  fireEvent.click(screen.getByRole('button', { name: 'Create alert' }))
  expect(onSubmit).toHaveBeenCalledTimes(1)
  expect(onSubmit.mock.calls[0]).toEqual([])
  expect(screen.getByRole('textbox', { name: 'Target price (USDT)' })).toHaveValue('unparsed input')
})

test('should render target item labels and forward actions without a market provider', () => {
  const onRearm = jest.fn()
  const onRemove = jest.fn()
  render(<TargetAlertItem title="Prepared target" statusText="Prepared status" hasTriggered
    rearmLabel="Rearm prepared target" removeLabel="Remove prepared target" onRearm={onRearm} onRemove={onRemove} />)
  expect(screen.getByRole('status')).toHaveTextContent('Prepared status')
  fireEvent.click(screen.getByRole('button', { name: 'Rearm prepared target' }))
  fireEvent.click(screen.getByRole('button', { name: 'Remove prepared target' }))
  expect(onRearm).toHaveBeenCalledTimes(1)
  expect(onRemove).toHaveBeenCalledTimes(1)
})

test('should display prepared action labels and forward clicks without owning favorite state', () => {
  const onToggleFavorite = jest.fn()
  const onHide = jest.fn()
  render(<MarketCurrencyActions isFavorite={false} favoriteTitle="Prepared favorite title"
    favoriteLabel="Prepared favorite action" hideLabel="Prepared hide action"
    onToggleFavorite={onToggleFavorite} onHide={onHide} />)
  const favorite = screen.getByRole('button', { name: 'Prepared favorite action' })
  fireEvent.click(favorite)
  expect(onToggleFavorite).toHaveBeenCalledTimes(1)
  expect(favorite).toHaveAttribute('aria-pressed', 'false')
  fireEvent.click(screen.getByRole('button', { name: 'Prepared hide action' }))
  expect(onHide).toHaveBeenCalledTimes(1)
})

test('should render prepared alert text without market data or alert calculations', () => {
  const onDismiss = jest.fn()
  render(<MarketAlerts hasAlerts alerts={[{
    id: 1, severity: 'success', title: 'Prepared alert title', detail: 'Prepared detail', onDismiss,
  }]} />)
  expect(screen.getByRole('alert')).toHaveTextContent('Prepared alert title')
  expect(screen.getByRole('alert')).toHaveTextContent('Prepared detail')
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(onDismiss).toHaveBeenCalledTimes(1)
})
