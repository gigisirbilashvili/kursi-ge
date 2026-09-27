import { useState } from 'react'
import { Box, Stack } from '@mui/material'

import { AVAILABLE_CURRENCIES } from '../../../../entities/currency'
import { AppButton } from '../../../../shared/ui/AppButton/AppButton'
import { AppChip } from '../../../../shared/ui/AppChip/AppChip'
import { OptionSelect } from '../../../../shared/ui/OptionSelect/OptionSelect'
import { SectionHeader } from '../../../../shared/ui/SectionHeader/SectionHeader'
import { StatusText } from '../../../../shared/ui/StatusText/StatusText'
import type { IPairManagerProps } from './types'

export function PairManager({ currencies, onAdd, onRemove }: IPairManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selection, setSelection] = useState('')
  const available = AVAILABLE_CURRENCIES.filter(
    ({ symbol }) => !currencies.some((currency) => currency.symbol === symbol),
  )
  const selected = available.some(({ symbol }) => symbol === selection)
    ? selection
    : (available[0]?.symbol ?? '')

  return (
    <Box className="mt-6">
      <AppButton
        variant="outlined"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="pair-manager"
      >
        Manage pairs ({currencies.length})
      </AppButton>

      {isExpanded && (
        <Box
          id="pair-manager"
          sx={{ bgcolor: 'background.default', borderColor: 'divider' }}
          className="mt-3 rounded-xl border border-solid p-4"
        >
          <SectionHeader
            title="Tracked markets"
            description="Add a USDT pair or remove its live subscription. Keep at least one pair. Hiding a currency only changes its visibility."
          />

          <Stack className="mt-3 flex-row flex-wrap gap-2">
            {currencies.map((currency) => (
              <AppChip
                key={currency.symbol}
                label={`${currency.ticker}/USDT`}
                size="medium"
                onDelete={currencies.length > 1 ? () => onRemove(currency.symbol) : undefined}
              />
            ))}
          </Stack>

          {available.length ? (
            <Stack className="mt-4 flex-col gap-3 sm:flex-row">
              <OptionSelect
                label="Pair to add"
                value={selected}
                onChange={setSelection}
                options={available.map(({ symbol, name, ticker }) => ({
                  value: symbol,
                  label: `${name} (${ticker}/USDT)`,
                }))}
                className="min-w-48"
              />

              <AppButton variant="contained" onClick={() => onAdd(selected)}>
                Add pair
              </AppButton>
            </Stack>
          ) : (
            <StatusText className="mt-3">All available pairs are tracked.</StatusText>
          )}
        </Box>
      )}
    </Box>
  )
}
