import {
  Alert,
  Box,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { formatConversionValue } from '../../lib/convertCurrency'
import { notify } from '../../../../shared/lib/notify'
import { AppButton } from '../../../../shared/ui/AppButton/AppButton'
import { AppChip } from '../../../../shared/ui/AppChip/AppChip'
import { OptionSelect } from '../../../../shared/ui/OptionSelect/OptionSelect'
import { SectionCard } from '../../../../shared/ui/SectionCard/SectionCard'
import { SectionHeader } from '../../../../shared/ui/SectionHeader/SectionHeader'
import { StatusText } from '../../../../shared/ui/StatusText/StatusText'
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
    <SectionCard headingId="conversion-heading" hasShadow className="p-5 sm:p-6">
      <Stack className="mb-6 flex-row flex-wrap items-center justify-between gap-3">
        <SectionHeader
          headingId="conversion-heading"
          title="Currency calculator"
          description="Convert using Binance prices, refreshed every 30 seconds."
          descriptionVariant="body2"
        />

        <AppChip label="Updates every 30s" isBrand />
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

            <AppButton
              variant="outlined"
              aria-label="Swap currencies"
              onClick={swap}
              className="min-h-10"
            >
              Swap
            </AppButton>

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

              <StatusText variant="body2">
                {result.message}
              </StatusText>
            </Stack>
          ) : result.status === 'stale' ? (
            <Alert severity="warning" className="mt-3" role="status">
              {result.message}
            </Alert>
          ) : (
            <StatusText variant="body2" className="mt-3">
              {result.status === 'empty'
                ? result.message
                : 'Correct the amount to see the conversion.'}
            </StatusText>
          )}
          <Typography color="textSecondary" variant="caption" className="mt-4 block">
            Estimated conversion using USDT prices. Excludes fees.
          </Typography>
        </Box>
      </Box>
    </SectionCard>
  )
}
