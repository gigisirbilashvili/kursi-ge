import { useState } from 'react'
import { Box, Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material'

import { AVAILABLE_CURRENCIES } from '../../../../entities/currency'
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
      <Button
        variant="outlined"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="pair-manager"
      >
        Manage pairs ({currencies.length})
      </Button>

      {isExpanded && (
        <Box
          id="pair-manager"
          className="mt-3 rounded-xl border border-solid border-border bg-background p-4"
        >
          <Typography component="h2" variant="h2">
            Tracked markets
          </Typography>

          <Typography className="mt-1 text-muted">
            Add a USDT pair or remove its live subscription. Keep at least one pair. Hiding a
            currency only changes its visibility.
          </Typography>

          <Stack className="mt-3 flex-row flex-wrap gap-2">
            {currencies.map((currency) => (
              <Chip
                key={currency.symbol}
                label={`${currency.ticker}/USDT`}
                onDelete={currencies.length > 1 ? () => onRemove(currency.symbol) : undefined}
              />
            ))}
          </Stack>

          {available.length ? (
            <Stack className="mt-4 flex-col gap-3 sm:flex-row">
              <TextField
                select
                label="Pair to add"
                size="small"
                value={selected}
                onChange={(event) => setSelection(event.target.value)}
                className="min-w-48"
              >
                {available.map((currency) => (
                  <MenuItem key={currency.symbol} value={currency.symbol}>
                    {currency.name} ({currency.ticker}/USDT)
                  </MenuItem>
                ))}
              </TextField>

              <Button variant="contained" onClick={() => onAdd(selected)}>
                Add pair
              </Button>
            </Stack>
          ) : (
            <Typography className="mt-3 text-muted">All available pairs are tracked.</Typography>
          )}
        </Box>
      )}
    </Box>
  )
}
