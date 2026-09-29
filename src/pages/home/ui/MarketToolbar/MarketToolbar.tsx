import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'

import { SortIcon } from '../../../../assets/icons'
import { AppButton } from '../../../../shared/ui/AppButton/AppButton'
import { OptionSelect } from '../../../../shared/ui/OptionSelect/OptionSelect'
import { StatusText } from '../../../../shared/ui/StatusText/StatusText'
import type { IMarketToolbarProps } from './types'

export function MarketToolbar({
  search,
  hasSearch,
  onSearchChange,
  onClearSearch,
  filter,
  onFilterChange,
  sortField,
  onSortFieldChange,
  sortOptions,
  sortLabel,
  isDescending,
  onToggleSort,
  isShowingHidden,
  onToggleHidden,
  hiddenLabel,
  hasHiddenItems,
  hiddenItems,
}: Readonly<IMarketToolbarProps>) {
  return (
    <>
      <Stack
        sx={{ borderColor: "divider" }}
        className="flex-row flex-wrap items-center gap-3 border-b p-5 sm:p-6"
      >
        <TextField
          label="Search currencies"
          size="small"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          slotProps={{
            htmlInput: { role: "searchbox" },
            input: {
              endAdornment: hasSearch ? (
                <InputAdornment position="end">
                  <AppButton
                    type="button"
                    size="small"
                    aria-label="Clear search"
                    onClick={onClearSearch}
                  >
                    Clear
                  </AppButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
          className="min-w-48 flex-1"
        />

        <ToggleButtonGroup
          size="small"
          exclusive
          value={filter}
          onChange={(_, value: string | null) => onFilterChange(value)}
          aria-label="Currency filter"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="favorites">Favorites</ToggleButton>
        </ToggleButtonGroup>

        <OptionSelect
          label="Sort by"
          value={sortField}
          onChange={onSortFieldChange}
          options={sortOptions}
          className="min-w-36"
        />

        <Tooltip
          title={sortLabel}
        >
          <IconButton
            aria-label={sortLabel}
            onClick={onToggleSort}
            sx={{ borderColor: "divider" }}
            className="border"
            size="small"
          >
            <SortIcon
              size={18}
              className={isDescending ? "rotate-180" : undefined}
            />
          </IconButton>
        </Tooltip>

        <AppButton
          type="button"
          onClick={onToggleHidden}
          aria-expanded={isShowingHidden}
          aria-controls="hidden-currencies"
          className="ml-auto"
        >
          {hiddenLabel}
        </AppButton>
      </Stack>
      {isShowingHidden && (
        <Box
          component="section"
          id="hidden-currencies"
          aria-label="Hidden currencies"
          sx={{ bgcolor: "background.default", borderColor: "divider" }}
          className="border-b p-5 sm:p-6"
        >
          <Typography component="h3" variant="spanBold" className="mb-2">
            Hidden currencies
          </Typography>
          {!hasHiddenItems ? (
            <StatusText>No hidden currencies.</StatusText>
          ) : (
            <Stack className="flex-row flex-wrap gap-2">
              {hiddenItems.map((item) => (
                <AppButton
                  key={item.id}
                  variant="outlined"
                  size="small"
                  onClick={item.onRestore}
                  aria-label={item.ariaLabel}
                >
                  {item.label}
                </AppButton>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </>
  )
}
