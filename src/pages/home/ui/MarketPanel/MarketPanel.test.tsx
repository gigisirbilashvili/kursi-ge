import { afterEach, beforeEach, expect, jest, test } from '@jest/globals'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import { CURRENCIES } from '../../../../entities/currency'
import { notify } from '../../../../shared/lib/notify'
import { MarketPanel } from './MarketPanel'
import type { IMarketPanelProps } from './types'

beforeEach(() => {
  jest.useFakeTimers()
  localStorage.clear()
  jest.spyOn(notify, 'success').mockReturnValue('test-notification')
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  jest.restoreAllMocks()
  jest.useRealTimers()
})

function setup() {
  const theme = createTheme({ palette: {
    surfaceShadow: { main: 'rgba(0, 0, 0, 0.03)' },
    brandSoft: { main: '#fdeef3', contrastText: '#651947' },
  } })
  const props: IMarketPanelProps = {
    currencies: CURRENCIES.slice(0, 2),
    snapshot: { status: 'connecting', quotes: {}, history: {}, message: null, retryAt: null },
    alerts: [],
    onRetry: jest.fn(),
    onDismissAlert: jest.fn(),
  }
  return { props, ...render(<MarketPanel {...props} />, {
    wrapper: ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>,
  }) }
}

test('should preserve search, favorites, hide and restore across desktop and mobile layouts', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime, ['skipHover']: true })
  setup()
  const desktop = () => within(screen.getByRole('table'))
  const mobile = () => within(screen.getByRole('list', { name: 'Cryptocurrency markets' }))
  expect(screen.getByText('2 visible')).toBeInTheDocument()
  expect(screen.getByText('Waiting for market data')).toBeInTheDocument()
  await user.click(desktop().getByRole('button', { name: 'Add Bitcoin to favorites' }))
  expect(mobile().getByRole('button', { name: 'Remove Bitcoin from favorites' })).toHaveAttribute('aria-pressed', 'true')
  await user.click(screen.getByRole('button', { name: 'Favorites' }))
  expect(desktop().queryByText('Ethereum')).not.toBeInTheDocument()
  expect(mobile().queryByText('Ethereum')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'All' }))
  await user.type(screen.getByRole('searchbox', { name: 'Search currencies' }), 'eth')
  expect(desktop().queryByText('Bitcoin')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Clear search' }))
  await user.click(mobile().getByRole('button', { name: 'Hide Bitcoin' }))
  expect(desktop().queryByText('Bitcoin')).not.toBeInTheDocument()
  expect(screen.getByText('1 visible')).toBeInTheDocument()
  const hiddenToggle = screen.getByRole('button', { name: 'Hidden (1)' })
  await user.click(hiddenToggle)
  expect(hiddenToggle).toHaveAttribute('aria-expanded', 'true')
  await user.click(screen.getByRole('button', { name: 'Restore Bitcoin' }))
  expect(desktop().getByText('Bitcoin')).toBeInTheDocument()
  expect(mobile().getByText('Bitcoin')).toBeInTheDocument()
  await user.type(screen.getByRole('searchbox', { name: 'Search currencies' }), 'no match')
  expect(screen.getByText('No currencies found')).toBeInTheDocument()
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
}, 15_000)

test('should preserve sorting, retry availability and alert dismissal', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime, ['skipHover']: true })
  const { props, rerender } = setup()
  await user.click(screen.getByRole('button', { name: 'Sort descending' }))
  expect(within(screen.getByRole('table')).getAllByRole('rowheader')[0]).toHaveAttribute('aria-label', 'Ethereum, ETH/USDT')
  await user.click(screen.getByRole('combobox', { name: 'Sort by' }))
  await user.click(screen.getByRole('option', { name: 'Current price' }))
  expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent('Current price')
  rerender(<MarketPanel {...props} snapshot={{ ...props.snapshot, status: 'error', message: 'Retrying prices.' }} alerts={[{
    id: 7, symbol: 'BTCUSDT', initialPrice: 100, currentPrice: 103, percentageChange: 3, direction: 'increased',
  }]} />)
  await user.click(screen.getByRole('button', { name: 'Retry connection' }))
  expect(props.onRetry).toHaveBeenCalledTimes(1)
  await user.click(within(screen.getByLabelText('Significant price alerts')).getByRole('button', { name: 'Close' }))
  expect(props.onDismissAlert).toHaveBeenCalledWith(7)
  rerender(<MarketPanel {...props} snapshot={{ ...props.snapshot, status: 'disconnected' }} />)
  expect(screen.getByRole('button', { name: 'Retry connection' })).toBeDisabled()
})
