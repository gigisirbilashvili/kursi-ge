import {
  Box,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { useConversionCalculatorModel } from '../../model/useConversionCalculatorModel'
import { AppAlert } from '../../../../shared/ui/AppAlert/AppAlert'
import { AppButton } from '../../../../shared/ui/AppButton/AppButton'
import { AppChip } from '../../../../shared/ui/AppChip/AppChip'
import { OptionSelect } from '../../../../shared/ui/OptionSelect/OptionSelect'
import { SectionCard } from '../../../../shared/ui/SectionCard/SectionCard'
import { SectionHeader } from '../../../../shared/ui/SectionHeader/SectionHeader'
import { StatusText } from '../../../../shared/ui/StatusText/StatusText'
import type { IConversionCalculatorProps } from './types'

export function ConversionCalculator({ currencies }: IConversionCalculatorProps) {
  const {
    amount,
    source,
    target,
    sourceTicker,
    currencyOptions,
    hasError,
    helperText,
    isReady,
    isWaiting,
    isStale,
    resultText,
    rateText,
    statusText,
    onAmountChange,
    onSourceChange,
    onTargetChange,
    onSwap,
    onAmountBlur,
  } = useConversionCalculatorModel(currencies)
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
              onChange={onSourceChange}
              options={currencyOptions}
              className="min-w-0"
            />

            <AppButton
              variant="outlined"
              aria-label="Swap currencies"
              onClick={onSwap}
              className="min-h-10"
            >
              Swap
            </AppButton>

            <OptionSelect
              label="Target currency"
              value={target}
              onChange={onTargetChange}
              options={currencyOptions}
              className="min-w-0"
            />
          </Box>

          <TextField
            id="conversion-amount"
            label="Amount"
            size="small"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            onBlur={onAmountBlur}
            error={hasError}
            helperText={helperText}
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
          {isReady ? (
            <>
              <Typography
                component="output"
                htmlFor="conversion-amount"
                aria-label="Converted amount"
                className="mt-2 block break-words text-2xl font-semibold tabular-nums"
              >
                {resultText}
              </Typography>

              <Typography color="textSecondary" variant="body2" className="mt-3 break-words">
                {rateText}
              </Typography>
            </>
          ) : isWaiting ? (
            <Stack className="gap-2">
              <Skeleton className="h-10 w-full max-w-48 motion-reduce:animate-none" />

              <StatusText variant="body2">
                {statusText}
              </StatusText>
            </Stack>
          ) : isStale ? (
            <AppAlert severity="warning" className="mt-3">
              {statusText}
            </AppAlert>
          ) : (
            <StatusText variant="body2" className="mt-3">
              {statusText}
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
