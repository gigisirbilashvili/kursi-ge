import { useEffect, useState } from 'react'
import { Alert, Avatar, Box, Button, Card, Chip, List, ListItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'

import { CURRENCIES, STALE_TIMEOUT_MS } from '../../../../entities/currency'
import { MarketPrice } from '../MarketPrice/MarketPrice'
import { SessionChange } from '../SessionChange/SessionChange'
import type { IMarketPanelProps } from './types'

export function MarketPanel({ snapshot, onRetry }: IMarketPanelProps) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const hasPrices = Object.keys(snapshot.quotes).length > 0
  const isConnected = snapshot.status === 'connected'
  const isWaiting = !hasPrices && (snapshot.status === 'connecting' || snapshot.status === 'reconnecting')
  const isUnavailable = !isConnected && snapshot.status !== 'connecting'
  const latestUpdate = Math.max(0, ...Object.values(snapshot.quotes).map(({ receivedAt }) => receivedAt))
  const age = latestUpdate ? Math.max(0, Math.floor((now - latestUpdate) / 1000)) : null
  const isQuoteStale = (symbol: string) => !isConnected || now - (snapshot.quotes[symbol]?.receivedAt ?? 0) >= STALE_TIMEOUT_MS

  return (
    <Card component="section" aria-labelledby="spot-market-heading" variant="outlined" className="mt-8 rounded-2xl shadow-[0_1px_3px_#24040a08]">
      <Stack className="flex-row flex-wrap items-center justify-between gap-4 border-b border-border p-5 sm:p-6">
        <Stack className="flex-row items-center gap-3">
          <Typography component="h2" variant="h2" id="spot-market-heading">Spot markets</Typography>
          <Chip label={`${CURRENCIES.length} assets`} size="small" className="bg-brand-soft text-xs font-medium text-brand" />
        </Stack>
        <Typography variant="caption" className="text-muted">Binance · USDT pairs</Typography>
      </Stack>
      <Alert role="status" aria-live="polite" severity={isUnavailable ? 'warning' : isConnected ? 'success' : 'info'} icon={false} className={`rounded-none border-b border-border px-5 sm:px-6 [&_.MuiAlert-message]:w-full ${isUnavailable ? 'bg-warning-soft text-stale' : 'bg-background text-muted'}`}>
        <Stack className="flex-row flex-wrap items-center justify-between gap-3">
          <Typography variant="body2">
            {snapshot.message ?? (isConnected ? 'Receiving market prices from Binance.' : 'Connecting to Binance. Waiting for the first prices…')}
            {isUnavailable && hasPrices && ' Last-known prices are shown below.'}
          </Typography>
          {isUnavailable && <Button variant="outlined" size="small" onClick={onRetry} disabled={snapshot.status === 'disconnected'} className="min-h-10">Retry connection</Button>}
        </Stack>
      </Alert>
      <TableContainer className="hidden sm:block">
        <Table className="table-fixed [&_.MuiTableCell-root]:border-border [&_.MuiTableCell-root]:px-6 [&_.MuiTableCell-root]:py-5 [&_.MuiTableCell-head]:py-4 [&_.MuiTableCell-head]:text-xs [&_.MuiTableCell-head]:text-muted">
          <Box component="caption" className="sr-only">Live cryptocurrency prices in USDT, latest tick direction, and percentage change since opening this page.</Box>
          <TableHead>
            <TableRow>
              <TableCell scope="col">Asset</TableCell>
              <TableCell scope="col" align="right">Price (USDT)</TableCell>
              <TableCell scope="col" align="right">Change since opening</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {CURRENCIES.map((currency) => (
              <TableRow key={currency.symbol} hover className="last:[&_.MuiTableCell-root]:border-b-0">
                <TableCell component="th" scope="row" aria-label={`${currency.name}, ${currency.ticker}/USDT`}>
                  <Stack className="flex-row items-center gap-3">
                    <Avatar aria-hidden="true" className={`size-10 text-[10px] font-bold ${currency.badgeClass}`}>{currency.ticker}</Avatar>
                    <Box><Typography className="font-semibold">{currency.name}</Typography><Typography variant="caption" className="text-muted">{currency.ticker}/USDT</Typography></Box>
                  </Stack>
                </TableCell>
                <TableCell align="right"><MarketPrice quote={snapshot.quotes[currency.symbol]} isStale={isQuoteStale(currency.symbol)} /></TableCell>
                <TableCell align="right"><SessionChange quote={snapshot.quotes[currency.symbol]} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <List aria-label="Cryptocurrency markets" disablePadding className="block sm:hidden">
        {CURRENCIES.map((currency) => (
          <ListItem key={currency.symbol} divider className="block p-5 last:border-b-0">
            <Stack className="flex-row items-center justify-between gap-2">
              <Stack className="min-w-0 flex-row items-center gap-2">
                <Avatar aria-hidden="true" className={`size-9 text-[9px] font-bold ${currency.badgeClass}`}>{currency.ticker}</Avatar>
                <Box><Typography className="font-semibold">{currency.name}</Typography><Typography variant="caption" className="text-muted">{currency.ticker}/USDT</Typography></Box>
              </Stack>
              <MarketPrice quote={snapshot.quotes[currency.symbol]} isStale={isQuoteStale(currency.symbol)} />
            </Stack>
            <Stack className="mt-4 flex-row items-center justify-between gap-2">
              <Typography variant="caption" className="text-muted">Since opening</Typography>
              <SessionChange quote={snapshot.quotes[currency.symbol]} />
            </Stack>
          </ListItem>
        ))}
      </List>
      <Stack className="flex-row flex-wrap justify-between gap-2 border-t border-border bg-background px-5 py-4 text-muted sm:px-6">
        <Typography variant="caption">Arrows beside prices show the latest tick. Percentages compare with your first session price.</Typography>
        <Typography variant="caption">{age === null ? (isWaiting ? 'Waiting for market data' : 'No prices received') : `Last update ${age < 2 ? 'just now' : `${age}s ago`}`}</Typography>
      </Stack>
    </Card>
  )
}
