import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { formatConversionValue } from '../../lib/convertCurrency'
import { useConversionCalculator } from '../../model/useConversionCalculator'
import type { IConversionCalculatorProps } from './types'

export function ConversionCalculator({ market, currencies }: IConversionCalculatorProps) {
  const { amount, setAmount, source, target, setSource, setTarget, swap, result } =
    useConversionCalculator(market, currencies)
  const sourceTicker = currencies.find(({ symbol }) => symbol === source)?.ticker ?? source
  const targetTicker = currencies.find(({ symbol }) => symbol === target)?.ticker ?? target
  const hasError = result.status === 'invalid'

  return (
    <Card
      component="section"
      aria-labelledby="conversion-heading"
      variant="outlined"
      className="mt-8 rounded-2xl p-5 shadow-[0_1px_3px_#24040a08] sm:p-6"
    >
      <Stack className="mb-6 flex-row flex-wrap items-center justify-between gap-3">
        <Box>
          <Typography component="h2" variant="h2" id="conversion-heading">
            Currency calculator
          </Typography>

          <Typography variant="body2" className="mt-1 text-muted">
            Convert using Binance prices, refreshed every 30 seconds.
          </Typography>
        </Box>

        <Chip label="Updates every 30s" size="small" className="bg-brand-soft text-xs text-brand" />
      </Stack>

      <Box className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Stack className="min-w-0 gap-4">
          <Box className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <TextField
              select
              label="Source currency"
              size="small"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="min-w-0"
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.symbol} value={currency.symbol}>
                  {currency.ticker} - {currency.name}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              aria-label="Swap currencies"
              onClick={swap}
              className="min-h-10"
            >
              Swap
            </Button>

            <TextField
              select
              label="Target currency"
              size="small"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              className="min-w-0"
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.symbol} value={currency.symbol}>
                  {currency.ticker} - {currency.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            id="conversion-amount"
            label="Amount"
            size="small"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            error={hasError}
            helperText={hasError ? result.message : 'Enter zero or a positive amount.'}
            slotProps={{
              htmlInput: { inputMode: 'decimal' },
              input: {
                endAdornment: <InputAdornment position="end">{sourceTicker}</InputAdornment>,
              },
            }}
          />
        </Stack>

        <Box className="min-w-0 rounded-xl border border-solid border-border bg-background p-5">
          <Typography className="text-sm text-muted">You receive</Typography>
          {result.status === 'ready' ? (
            <>
              <Typography
                component="output"
                htmlFor="conversion-amount"
                aria-label="Converted amount"
                className="mt-2 block break-words text-2xl font-semibold tabular-nums"
              >
                {formatConversionValue(result.value)} {targetTicker}
              </Typography>

              <Typography variant="body2" className="mt-3 break-words text-muted">
                1 {sourceTicker} ≈ {formatConversionValue(result.rate)} {targetTicker}
              </Typography>
            </>
          ) : result.status === 'waiting' ? (
            <Stack className="gap-2">
              <Skeleton className="h-10 w-full max-w-48 motion-reduce:animate-none" />

              <Typography role="status" variant="body2" className="text-muted">
                {result.message}
              </Typography>
            </Stack>
          ) : result.status === 'stale' ? (
            <Alert severity="warning" className="mt-3" role="status">
              {result.message}
            </Alert>
          ) : (
            <Typography role="status" variant="body2" className="mt-3 text-muted">
              {result.status === 'empty'
                ? result.message
                : 'Correct the amount to see the conversion.'}
            </Typography>
          )}
          <Typography variant="caption" className="mt-4 block text-muted">
            Estimated conversion using USDT prices. Excludes fees.
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}
