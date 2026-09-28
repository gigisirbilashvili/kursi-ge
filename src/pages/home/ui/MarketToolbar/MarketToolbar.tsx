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

import type { TMarketFilter } from '../../../../features/market-preferences'
import { SortIcon } from '../../../../assets/icons'
import { AppButton } from '../../../../shared/ui/AppButton/AppButton'
import { OptionSelect } from '../../../../shared/ui/OptionSelect/OptionSelect'
import { StatusText } from '../../../../shared/ui/StatusText/StatusText'
import type { IMarketToolbarProps } from './types'

export function MarketToolbar({
  search,
  setSearch,
  filter,
  setFilter,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  isShowingHidden,
  setIsShowingHidden,
  hiddenCurrencies,
  restore,
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
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            htmlInput: { role: "searchbox" },
            input: {
              endAdornment: search ? (
                <InputAdornment position="end">
                  <AppButton
                    type="button"
                    size="small"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
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
          onChange={(_, value: TMarketFilter | null) => {
            if (value) setFilter(value);
          }}
          aria-label="Currency filter"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="favorites">Favorites</ToggleButton>
        </ToggleButtonGroup>

        <OptionSelect
          label="Sort by"
          value={sortField}
          onChange={(value) => {
            if (value === 'name' || value === 'price' || value === 'change') setSortField(value)
          }}
          options={[
            { value: "name", label: "Name" },
            { value: "price", label: "Current price" },
            { value: "change", label: "Price change" },
          ]}
          className="min-w-36"
        />

        <Tooltip
          title={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
        >
          <IconButton
            aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
            sx={{ borderColor: "divider" }}
            className="border"
            size="small"
          >
            <SortIcon
              size={18}
              className={sortDirection === "desc" ? "rotate-180" : undefined}
            />
          </IconButton>
        </Tooltip>

        <AppButton
          type="button"
          onClick={() => setIsShowingHidden(!isShowingHidden)}
          aria-expanded={isShowingHidden}
          aria-controls="hidden-currencies"
          className="ml-auto"
        >
          Hidden ({hiddenCurrencies.length})
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
          {hiddenCurrencies.length === 0 ? (
            <StatusText>No hidden currencies.</StatusText>
          ) : (
            <Stack className="flex-row flex-wrap gap-2">
              {hiddenCurrencies.map((currency) => (
                <AppButton
                  key={currency.symbol}
                  variant="outlined"
                  size="small"
                  onClick={() => restore(currency.symbol)}
                  aria-label={`Restore ${currency.name}`}
                >
                  Restore {currency.ticker}
                </AppButton>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </>
  )
}
