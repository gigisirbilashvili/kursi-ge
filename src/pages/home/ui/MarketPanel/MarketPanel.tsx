import { useEffect, useState } from 'react'
import { Alert, Avatar, Box, Button, Card, Chip, FormControl, IconButton, InputAdornment, InputLabel, List, ListItem, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material'

import { CURRENCIES, STALE_TIMEOUT_MS } from '../../../../entities/currency'
import { selectCurrencies, useMarketPreferences } from '../../../../features/market-preferences'
import type { TMarketFilter, TSortDirection, TSortField } from '../../../../features/market-preferences'
import { useSignificantAlerts } from '../../../../features/significant-alerts'
import { FavoriteIcon, SortIcon } from '../../../../shared/ui/icons'
import { formatPrice } from '../../lib/formatPrice'
import { MarketPrice } from '../MarketPrice/MarketPrice'
import { SessionChange } from '../SessionChange/SessionChange'
import type { IMarketPanelProps } from './types'

export function MarketPanel({ snapshot, onRetry }: IMarketPanelProps) {
  const [now, setNow] = useState(Date.now)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<TMarketFilter>('all')
  const [sortField, setSortField] = useState<TSortField>('name')
  const [sortDirection, setSortDirection] = useState<TSortDirection>('asc')
  const [isShowingHidden, setIsShowingHidden] = useState(false)
  const { preferences, toggleFavorite, hide, restore } = useMarketPreferences()
  const { alerts, dismiss } = useSignificantAlerts(snapshot)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const visibleCurrencies = selectCurrencies(CURRENCIES, snapshot, preferences, search, filter, sortField, sortDirection)
  const hiddenCurrencies = CURRENCIES.filter(({ symbol }) => preferences.hidden.includes(symbol))
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
          <Chip label={`${CURRENCIES.length - preferences.hidden.length} visible`} size="small" className="bg-brand-soft text-xs font-medium text-brand" />
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
      {alerts.length > 0 && (
        <Stack aria-label="Significant price alerts" className="gap-2 border-b border-border p-5 sm:p-6">
          {alerts.map((alert) => {
            const currency = CURRENCIES.find(({ symbol }) => symbol === alert.symbol)
            return (
              <Alert key={alert.id} severity={alert.direction === 'increased' ? 'success' : 'warning'} onClose={() => dismiss(alert.id)}>
                <Typography variant="body2" className="font-semibold">{currency?.name ?? alert.symbol} ({currency?.ticker ?? alert.symbol}/USDT) {alert.direction} by {Math.abs(alert.percentageChange).toFixed(2)}% since you opened the page.</Typography>
                <Typography variant="caption">Initial: {formatPrice(alert.initialPrice)} USDT · Current: {formatPrice(alert.currentPrice)} USDT · Direction: {alert.direction}</Typography>
              </Alert>
            )
          })}
        </Stack>
      )}
      <Stack className="flex-row flex-wrap items-center gap-3 border-b border-border p-5 sm:p-6">
        <TextField
          label="Search currencies"
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            htmlInput: { role: 'searchbox' },
            input: {
              endAdornment: search ? (
                <InputAdornment position="end">
                  <Button type="button" size="small" aria-label="Clear search" onClick={() => setSearch('')}>Clear</Button>
                </InputAdornment>
              ) : undefined,
            },
          }}
          className="min-w-48 flex-1"
        />
        <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, value: TMarketFilter | null) => { if (value) setFilter(value) }} aria-label="Currency filter">
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="favorites">Favorites</ToggleButton>
        </ToggleButtonGroup>
        <FormControl size="small" className="min-w-36">
          <InputLabel id="market-sort-label">Sort by</InputLabel>
          <Select labelId="market-sort-label" label="Sort by" value={sortField} onChange={(event) => setSortField(event.target.value as TSortField)}>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="price">Current price</MenuItem>
            <MenuItem value="change">Price change</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}>
          <IconButton aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`} onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')} className="border border-border" size="small">
            <SortIcon width={18} height={18} className={sortDirection === 'desc' ? 'rotate-180' : undefined} />
          </IconButton>
        </Tooltip>
        <Button type="button" onClick={() => setIsShowingHidden(!isShowingHidden)} aria-expanded={isShowingHidden} aria-controls="hidden-currencies" className="ml-auto">Hidden ({hiddenCurrencies.length})</Button>
      </Stack>
      {isShowingHidden && (
        <Box component="section" id="hidden-currencies" aria-label="Hidden currencies" className="border-b border-border bg-background p-5 sm:p-6">
          <Typography component="h3" className="mb-2 font-semibold">Hidden currencies</Typography>
          {hiddenCurrencies.length === 0 ? <Typography className="text-muted">No hidden currencies.</Typography> : (
            <Stack className="flex-row flex-wrap gap-2">
              {hiddenCurrencies.map((currency) => <Button key={currency.symbol} variant="outlined" size="small" onClick={() => restore(currency.symbol)} aria-label={`Restore ${currency.name}`}>Restore {currency.ticker}</Button>)}
            </Stack>
          )}
        </Box>
      )}
      {visibleCurrencies.length === 0 ? (
        <Box role="status" className="px-5 py-12 text-center sm:px-6">
          <Typography component="h3" className="font-semibold">No currencies found</Typography>
          <Typography className="mt-1 text-muted">Try another search, switch to All, or restore a hidden currency.</Typography>
        </Box>
      ) : (
        <>
          <TableContainer className="hidden md:block">
            <Table className="table-fixed [&_.MuiTableCell-root]:border-border [&_.MuiTableCell-root]:px-6 [&_.MuiTableCell-root]:py-5 [&_.MuiTableCell-head]:py-4 [&_.MuiTableCell-head]:text-xs [&_.MuiTableCell-head]:text-muted">
              <Box component="caption" className="sr-only">Live cryptocurrency prices in USDT, latest tick direction, percentage change since opening, favorite status, and visibility actions.</Box>
              <TableHead>
                <TableRow>
                  <TableCell scope="col">Asset</TableCell>
                  <TableCell scope="col" align="right">Price (USDT)</TableCell>
                  <TableCell scope="col" align="right">Change since opening</TableCell>
                  <TableCell scope="col" align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleCurrencies.map((currency) => {
                  const isFavorite = preferences.favorites.includes(currency.symbol)
                  return (
                    <TableRow key={currency.symbol} hover className="last:[&_.MuiTableCell-root]:border-b-0">
                      <TableCell component="th" scope="row" aria-label={`${currency.name}, ${currency.ticker}/USDT`}>
                        <Stack className="flex-row items-center gap-3">
                          <Avatar aria-hidden="true" className={`size-10 text-[10px] font-bold ${currency.badgeClass}`}>{currency.ticker}</Avatar>
                          <Box><Typography className="font-semibold">{currency.name}</Typography><Typography variant="caption" className="text-muted">{currency.ticker}/USDT</Typography></Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right"><MarketPrice quote={snapshot.quotes[currency.symbol]} isStale={isQuoteStale(currency.symbol)} /></TableCell>
                      <TableCell align="right"><SessionChange quote={snapshot.quotes[currency.symbol]} /></TableCell>
                      <TableCell align="right">
                        <Stack className="flex-row items-center justify-end gap-1">
                          <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}><IconButton size="small" color={isFavorite ? 'primary' : 'default'} aria-label={`${isFavorite ? 'Remove' : 'Add'} ${currency.name} ${isFavorite ? 'from' : 'to'} favorites`} aria-pressed={isFavorite} onClick={() => toggleFavorite(currency.symbol)}><FavoriteIcon width={20} height={20} isFilled={isFavorite} /></IconButton></Tooltip>
                          <Button size="small" onClick={() => hide(currency.symbol)} aria-label={`Hide ${currency.name}`}>Hide</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <List aria-label="Cryptocurrency markets" disablePadding className="block md:hidden">
            {visibleCurrencies.map((currency) => {
              const isFavorite = preferences.favorites.includes(currency.symbol)
              return (
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
                  <Stack className="mt-3 flex-row items-center justify-end gap-2">
                    <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}><IconButton size="small" color={isFavorite ? 'primary' : 'default'} aria-label={`${isFavorite ? 'Remove' : 'Add'} ${currency.name} ${isFavorite ? 'from' : 'to'} favorites`} aria-pressed={isFavorite} onClick={() => toggleFavorite(currency.symbol)}><FavoriteIcon width={20} height={20} isFilled={isFavorite} /></IconButton></Tooltip>
                    <Button size="small" onClick={() => hide(currency.symbol)} aria-label={`Hide ${currency.name}`}>Hide</Button>
                  </Stack>
                </ListItem>
              )
            })}
          </List>
        </>
      )}
      <Stack className="flex-row flex-wrap justify-between gap-2 border-t border-border bg-background px-5 py-4 text-muted sm:px-6">
        <Typography variant="caption">Arrows beside prices show the latest tick. Percentages compare with your first session price.</Typography>
        <Typography variant="caption">{age === null ? (isWaiting ? 'Waiting for market data' : 'No prices received') : `Last update ${age < 2 ? 'just now' : `${age}s ago`}`}</Typography>
      </Stack>
    </Card>
  )
}
