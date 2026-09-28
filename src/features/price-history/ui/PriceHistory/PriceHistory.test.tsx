import { afterEach, beforeEach, expect, jest, test } from '@jest/globals'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import type {} from '@mui/x-charts/themeAugmentation'

import { CURRENCIES } from '../../../../entities/currency'
import type { IMarketSnapshot } from '../../../../entities/currency'
import { PriceHistory } from './PriceHistory'

beforeEach(() => { jest.useFakeTimers() })
afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

function setup(market: IMarketSnapshot) {
  const theme = createTheme({ components: { MuiLineChart: { defaultProps: { width: 640 } } } })
  return render(<PriceHistory currencies={CURRENCIES.slice(0, 2)} market={market} />, {
    wrapper: ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>,
  })
}

function snapshot(): IMarketSnapshot {
  return { status: 'connected', quotes: {}, history: {}, message: null, retryAt: null }
}

test('should wait for two points and render a flat-price chart with an accessible description', () => {
  const market = snapshot()
  const { rerender, container } = setup(market)
  expect(screen.getByRole('status')).toHaveTextContent('Waiting for two live updates')
  rerender(<PriceHistory currencies={CURRENCIES} market={{ ...market, history: {
    BTCUSDT: [{ time: 1000, price: 100 }, { time: 2000, price: 100 }],
  } }} />)
  expect(screen.queryByText(/Waiting for two live updates/)).not.toBeInTheDocument()
  expect(screen.getByLabelText('Bitcoin session price chart')).toHaveAccessibleDescription('From 100 to 100 USDT. Low 100, high 100.')
  const line = container.querySelector('.MuiLineChart-line')
  expect(line).toBeInTheDocument()
  expect(line?.getAttribute('d')).not.toMatch(/NaN|Infinity/)
})

test('should sample new prices every ten seconds and switch currencies immediately', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  const market: IMarketSnapshot = { ...snapshot(), history: {
    BTCUSDT: [{ time: 1000, price: 100 }, { time: 2000, price: 102 }],
    ETHUSDT: [{ time: 1000, price: 10 }, { time: 2000, price: 11 }],
  } }
  const { rerender, unmount } = setup(market)
  const updated: IMarketSnapshot = { ...market, history: {
    ...market.history,
    BTCUSDT: [...market.history.BTCUSDT, { time: 3000, price: 105 }],
  } }
  rerender(<PriceHistory currencies={CURRENCIES.slice(0, 2)} market={updated} />)
  expect(screen.getByText('High 102')).toBeInTheDocument()
  act(() => { jest.advanceTimersByTime(9999) })
  expect(screen.getByText('High 102')).toBeInTheDocument()
  act(() => { jest.advanceTimersByTime(1) })
  expect(screen.getByText('High 105')).toBeInTheDocument()
  await user.click(screen.getByRole('combobox', { name: 'Chart currency' }))
  await user.click(screen.getByRole('option', { name: 'ETH/USDT' }))
  expect(screen.getByLabelText('Ethereum session price chart')).toBeInTheDocument()
  expect(screen.getByText('High 11')).toBeInTheDocument()
  rerender(<PriceHistory currencies={CURRENCIES.slice(0, 2)} market={{ ...updated, status: 'reconnecting' }} />)
  expect(screen.getByText('History is paused until live prices return.')).toBeInTheDocument()
  expect(screen.getByText('High 11')).toBeInTheDocument()
  unmount()
  act(() => { jest.runOnlyPendingTimers() })
  expect(jest.getTimerCount()).toBe(0)
}, 15_000)
