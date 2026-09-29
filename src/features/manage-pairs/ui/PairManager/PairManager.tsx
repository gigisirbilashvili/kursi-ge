import { Box, Stack } from '@mui/material'

import { usePairManagerModel } from '../../model/usePairManagerModel'
import { AppButton } from '../../../../shared/ui/AppButton/AppButton'
import { AppChip } from '../../../../shared/ui/AppChip/AppChip'
import { OptionSelect } from '../../../../shared/ui/OptionSelect/OptionSelect'
import { SectionHeader } from '../../../../shared/ui/SectionHeader/SectionHeader'
import { StatusText } from '../../../../shared/ui/StatusText/StatusText'
import type { IPairManagerProps } from './types'

export function PairManager(props: IPairManagerProps) {
  const {
    isExpanded,
    selected,
    buttonText,
    hasAvailablePairs,
    pairs,
    options,
    onToggle,
    onSelectionChange,
    onAdd,
  } = usePairManagerModel(props)
  return (
    <Box className="mt-6">
      <AppButton
        variant="outlined"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls="pair-manager"
      >
        {buttonText}
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
            {pairs.map((pair) => (
              <AppChip
                key={pair.id}
                label={pair.label}
                size="medium"
                onDelete={pair.onRemove}
              />
            ))}
          </Stack>

          {hasAvailablePairs ? (
            <Stack className="mt-4 flex-col gap-3 sm:flex-row">
              <OptionSelect
                label="Pair to add"
                value={selected}
                onChange={onSelectionChange}
                options={options}
                className="min-w-48"
              />

              <AppButton variant="contained" onClick={onAdd}>
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
