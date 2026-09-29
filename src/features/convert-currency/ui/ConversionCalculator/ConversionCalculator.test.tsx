import { afterEach, beforeEach, expect, jest, test } from '@jest/globals'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import { CURRENCIES } from '../../../../entities/currency'
import { MarketFeedContext } from '../../../../entities/currency/model/marketFeedContext'
import { createMarketFeedFixture } from '../../../../entities/currency/model/testing/createMarketFeedFixture'
import { notify } from '../../../../shared/lib/notify'
import { ConversionCalculator } from './ConversionCalculator'

beforeEach(() => { jest.useFakeTimers() })
afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
  jest.useRealTimers()
})

test('should update immediately for either price, swap currencies, and validate input', () => {
  const error = jest.spyOn(notify, 'error').mockReturnValue('test')
  const quote = {
    price: 100, initialPrice: 100, previousPrice: 100, percentageChange: 0,
    direction: 'unchanged' as const, eventTime: 1, receivedAt: Date.now(),
  }
  const { feed, publish } = createMarketFeedFixture({
    status: 'connected', history: {}, message: null, retryAt: null,
    quotes: { BTCUSDT: quote, ETHUSDT: { ...quote, price: 50 } },
  })
  const theme = createTheme({ palette: {
    surfaceShadow: { main: 'rgba(0, 0, 0, 0.03)' },
    brandSoft: { main: '#fdeef3', contrastText: '#651947' },
  } })
  const { unmount } = render(<ConversionCalculator currencies={CURRENCIES} />, {
    wrapper: ({ children }) => <ThemeProvider theme={theme}><MarketFeedContext.Provider value={feed}>{children}</MarketFeedContext.Provider></ThemeProvider>,
  })
  expect(screen.getByLabelText('Converted amount')).toHaveTextContent('2 ETH')
  act(() => {
    publish({ ...feed.getSnapshot(), quotes: { BTCUSDT: { ...quote, price: 200 }, ETHUSDT: { ...quote, price: 50 } } })
  })
  expect(screen.getByLabelText('Converted amount')).toHaveTextContent('4 ETH')
  act(() => {
    publish({ ...feed.getSnapshot(), quotes: { BTCUSDT: { ...quote, price: 200 }, ETHUSDT: quote } })
  })
  expect(screen.getByLabelText('Converted amount')).toHaveTextContent('2 ETH')
  fireEvent.click(screen.getByRole('button', { name: 'Swap currencies' }))
  expect(screen.getByLabelText('Converted amount')).toHaveTextContent('0.5 BTC')
  const input = screen.getByRole('textbox', { name: 'Amount' })
  fireEvent.change(input, { target: { value: '-1' } })
  expect(input).toHaveAttribute('aria-invalid', 'true')
  expect(screen.queryByLabelText('Converted amount')).not.toBeInTheDocument()
  fireEvent.blur(input)
  expect(error).toHaveBeenCalledTimes(1)
  fireEvent.change(input, { target: { value: '2' } })
  expect(screen.getByLabelText('Converted amount')).toHaveTextContent('1 BTC')
  unmount()
  act(() => { jest.runOnlyPendingTimers() })
  expect(jest.getTimerCount()).toBe(0)
})
