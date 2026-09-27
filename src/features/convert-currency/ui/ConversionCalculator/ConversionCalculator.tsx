import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { formatConversionValue } from '../../lib/convertCurrency'
import { notify } from '../../../../shared/lib/notify'
import { OptionSelect } from '../../../../shared/ui/OptionSelect/OptionSelect'
import { useConversionCalculator } from '../../model/useConversionCalculator'
import type { IConversionCalculatorProps } from './types'

export function ConversionCalculator({ market, currencies }: IConversionCalculatorProps) {
  const { amount, setAmount, source, target, setSource, setTarget, swap, result } =
    useConversionCalculator(market, currencies)
  const sourceTicker = currencies.find(({ symbol }) => symbol === source)?.ticker ?? source
  const targetTicker = currencies.find(({ symbol }) => symbol === target)?.ticker ?? target
  const currencyOptions = currencies.map(({ symbol, ticker, name }) => ({
    value: symbol,
    label: `${ticker} - ${name}`,
  }))
  const hasError = result.status === 'invalid'

  return (
    <Card
      component="section"
      aria-labelledby="conversion-heading"
      variant="outlined"
      sx={{ boxShadow: (theme) => `0 1px 3px ${theme.palette.surfaceShadow.main}` }}
      className="mt-8 rounded-2xl p-5 sm:p-6"
    >
      <Stack className="mb-6 flex-row flex-wrap items-center justify-between gap-3">
        <Box>
          <Typography component="h2" variant="h2" id="conversion-heading">
            Currency calculator
          </Typography>

          <Typography color="textSecondary" variant="body2" className="mt-1">
            Convert using Binance prices, refreshed every 30 seconds.
          </Typography>
        </Box>

        <Chip label="Updates every 30s" size="small" color="brandSoft" className="text-xs font-medium" />
      </Stack>

      <Box className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Stack className="min-w-0 gap-4">
          <Box className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <OptionSelect
              label="Source currency"
              value={source}
              onChange={setSource}
              options={currencyOptions}
              className="min-w-0"
            />

            <Button
              variant="outlined"
              aria-label="Swap currencies"
              onClick={swap}
              className="min-h-10"
            >
              Swap
            </Button>

            <OptionSelect
              label="Target currency"
              value={target}
              onChange={setTarget}
              options={currencyOptions}
              className="min-w-0"
            />
          </Box>

          <TextField
            id="conversion-amount"
            label="Amount"
            size="small"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            onBlur={() => {
              if (hasError) notify.error(result.message, { toastId: 'conversion-invalid' })
            }}
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

        <Box
          sx={{ bgcolor: 'background.default', borderColor: 'divider' }}
          className="min-w-0 rounded-xl border border-solid p-5"
        >
          <Typography color="textSecondary" variant="body1">You receive</Typography>
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

              <Typography color="textSecondary" variant="body2" className="mt-3 break-words">
                1 {sourceTicker} ≈ {formatConversionValue(result.rate)} {targetTicker}
              </Typography>
            </>
          ) : result.status === 'waiting' ? (
            <Stack className="gap-2">
              <Skeleton className="h-10 w-full max-w-48 motion-reduce:animate-none" />

              <Typography color="textSecondary" role="status" variant="body2">
                {result.message}
              </Typography>
            </Stack>
          ) : result.status === 'stale' ? (
            <Alert severity="warning" className="mt-3" role="status">
              {result.message}
            </Alert>
          ) : (
            <Typography color="textSecondary" role="status" variant="body2" className="mt-3">
              {result.status === 'empty'
                ? result.message
                : 'Correct the amount to see the conversion.'}
            </Typography>
          )}
          <Typography color="textSecondary" variant="caption" className="mt-4 block">
            Estimated conversion using USDT prices. Excludes fees.
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}
