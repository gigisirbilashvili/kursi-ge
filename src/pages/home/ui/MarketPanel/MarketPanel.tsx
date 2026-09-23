import { useEffect, useState } from 'react'
import { Alert, Avatar, Box, Button, Card, Chip, List, ListItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { visuallyHidden } from '@mui/utils'

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
    <Card component="section" aria-labelledby="spot-market-heading" variant="outlined" sx={{ mt: 4, borderRadius: '16px', boxShadow: '0 1px 3px #24040a08' }}>
      <Stack direction="row" sx={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: { xs: 2.5, sm: 3 }, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography component="h2" variant="h2" id="spot-market-heading">Spot markets</Typography>
          <Chip label={`${CURRENCIES.length} assets`} size="small" sx={{ bgcolor: '#fdeef3', color: 'primary.main', fontSize: 12 }} />
        </Stack>
        <Typography variant="caption" color="text.secondary">Binance · USDT pairs</Typography>
      </Stack>
      <Alert role="status" aria-live="polite" severity={isUnavailable ? 'warning' : isConnected ? 'success' : 'info'} icon={false} sx={{ borderRadius: 0, borderBottom: 1, borderColor: 'divider', bgcolor: isUnavailable ? '#fff8eb' : 'background.default', color: isUnavailable ? 'warning.main' : 'text.secondary', px: { xs: 2.5, sm: 3 }, '& .MuiAlert-message': { width: '100%' } }}>
        <Stack direction="row" sx={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Typography variant="body2">
            {snapshot.message ?? (isConnected ? 'Receiving market prices from Binance.' : 'Connecting to Binance. Waiting for the first prices…')}
            {isUnavailable && hasPrices && ' Last-known prices are shown below.'}
          </Typography>
          {isUnavailable && <Button variant="outlined" size="small" onClick={onRetry} disabled={snapshot.status === 'disconnected'} sx={{ minHeight: 40 }}>Retry connection</Button>}
        </Stack>
      </Alert>
      <TableContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <Box component="caption" sx={visuallyHidden}>Live cryptocurrency prices in USDT, latest tick direction, and percentage change since opening this page.</Box>
          <TableHead>
            <TableRow>
              <TableCell scope="col">Asset</TableCell>
              <TableCell scope="col" align="right">Price (USDT)</TableCell>
              <TableCell scope="col" align="right">Change since opening</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {CURRENCIES.map((currency) => (
              <TableRow key={currency.symbol} hover sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                <TableCell component="th" scope="row" aria-label={`${currency.name}, ${currency.ticker}/USDT`}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar aria-hidden="true" sx={{ width: 40, height: 40, fontSize: 10, fontWeight: 700, bgcolor: currency.badgeBackground, color: currency.badgeColor }}>{currency.ticker}</Avatar>
                    <Box><Typography sx={{ fontWeight: 600 }}>{currency.name}</Typography><Typography variant="caption" color="text.secondary">{currency.ticker}/USDT</Typography></Box>
                  </Stack>
                </TableCell>
                <TableCell align="right"><MarketPrice quote={snapshot.quotes[currency.symbol]} isStale={isQuoteStale(currency.symbol)} /></TableCell>
                <TableCell align="right"><SessionChange quote={snapshot.quotes[currency.symbol]} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <List aria-label="Cryptocurrency markets" disablePadding sx={{ display: { xs: 'block', sm: 'none' } }}>
        {CURRENCIES.map((currency) => (
          <ListItem key={currency.symbol} divider sx={{ display: 'block', p: 2.5, '&:last-child': { borderBottom: 0 } }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              <Stack direction="row" spacing={1} sx={{ minWidth: 0, alignItems: 'center' }}>
                <Avatar aria-hidden="true" sx={{ width: 36, height: 36, fontSize: 9, fontWeight: 700, bgcolor: currency.badgeBackground, color: currency.badgeColor }}>{currency.ticker}</Avatar>
                <Box><Typography sx={{ fontWeight: 600 }}>{currency.name}</Typography><Typography variant="caption" color="text.secondary">{currency.ticker}/USDT</Typography></Box>
              </Stack>
              <MarketPrice quote={snapshot.quotes[currency.symbol]} isStale={isQuoteStale(currency.symbol)} />
            </Stack>
            <Stack direction="row" sx={{ mt: 2, alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">Since opening</Typography>
              <SessionChange quote={snapshot.quotes[currency.symbol]} />
            </Stack>
          </ListItem>
        ))}
      </List>
      <Stack direction="row" sx={{ flexWrap: 'wrap', justifyContent: 'space-between', gap: 1, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default', px: { xs: 2.5, sm: 3 }, py: 2, color: 'text.secondary' }}>
        <Typography variant="caption">Arrows beside prices show the latest tick. Percentages compare with your first session price.</Typography>
        <Typography variant="caption">{age === null ? (isWaiting ? 'Waiting for market data' : 'No prices received') : `Last update ${age < 2 ? 'just now' : `${age}s ago`}`}</Typography>
      </Stack>
    </Card>
  )
}
