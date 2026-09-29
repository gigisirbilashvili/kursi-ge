import { describe, afterEach, expect, test } from '@jest/globals'
import { act, cleanup, render, screen } from '@testing-library/react'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import { MarketFeedContext } from '../../../../entities/currency/model/marketFeedContext'
import { createMarketFeedFixture } from '../../../../entities/currency/model/testing/createMarketFeedFixture'
import type { ICurrencyQuote } from '../../../../entities/currency'
import { MarketPrice } from './MarketPrice'

describe('.<MarketPrice/>', () => {
  afterEach(cleanup)

  test.each(['light', 'dark'] as const)('should update the arrow color with each price direction in %s mode', (mode) => {
    const theme = createTheme({ palette: {
      mode,
      success: { main: '#008800' },
      error: { main: '#cc0000' },
      text: { secondary: '#777777' },
    } })
    const quote: ICurrencyQuote = {
      price: 101, initialPrice: 100, previousPrice: 100, percentageChange: 1,
      direction: 'up', receivedAt: Date.now(), eventTime: 1,
    }
    const { feed, publish } = createMarketFeedFixture({
      status: 'connected', quotes: { BTCUSDT: quote }, history: {}, message: null, retryAt: null,
    })
    render(<MarketPrice symbol="BTCUSDT" />, {
      wrapper: ({ children }) => <ThemeProvider theme={theme}><MarketFeedContext.Provider value={feed}>{children}</MarketFeedContext.Provider></ThemeProvider>,
    })
    const arrowWrapper = () => screen.getByText(/Latest tick (up|down|unchanged)\./).parentElement
    expect(arrowWrapper()).toHaveStyle({ color: 'rgb(0, 136, 0)' })
    expect(arrowWrapper()?.querySelector('path')).toHaveAttribute('stroke', 'currentColor')

    act(() => publish({ ...feed.getSnapshot(), quotes: {
      BTCUSDT: { ...quote, price: 99, direction: 'down', eventTime: 2 },
    } }))
    expect(arrowWrapper()).toHaveStyle({ color: 'rgb(204, 0, 0)' })

    act(() => publish({ ...feed.getSnapshot(), quotes: {
      BTCUSDT: { ...quote, price: 99, direction: 'unchanged', eventTime: 3 },
    } }))
    expect(arrowWrapper()).toHaveStyle({ color: 'rgb(119, 119, 119)' })
  })
})
