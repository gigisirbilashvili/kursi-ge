import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AVAILABLE_CURRENCIES,
  STALE_TIMEOUT_MS,
} from "../../../../entities/currency";
import {
  selectCurrencies,
  useMarketPreferences,
} from "../../../../features/market-preferences";
import type {
  TMarketFilter,
  TSortDirection,
  TSortField,
} from "../../../../features/market-preferences";
import { FavoriteIcon, SortIcon } from "../../../../assets/icons";
import { AppAlert } from "../../../../shared/ui/AppAlert/AppAlert";
import { AppButton } from "../../../../shared/ui/AppButton/AppButton";
import { AppChip } from "../../../../shared/ui/AppChip/AppChip";
import { OptionSelect } from "../../../../shared/ui/OptionSelect/OptionSelect";
import { SectionCard } from "../../../../shared/ui/SectionCard/SectionCard";
import { StatusText } from "../../../../shared/ui/StatusText/StatusText";
import { formatPrice } from "../../lib/formatPrice";
import { MarketPrice } from "../MarketPrice/MarketPrice";
import { SessionChange } from "../SessionChange/SessionChange";
import type { IMarketPanelProps } from "./types";

export function MarketPanel({
  snapshot,
  onRetry,
  currencies,
  alerts,
  onDismissAlert,
}: IMarketPanelProps) {
  const [now, setNow] = useState(Date.now);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TMarketFilter>("all");
  const [sortField, setSortField] = useState<TSortField>("name");
  const [sortDirection, setSortDirection] = useState<TSortDirection>("asc");
  const [isShowingHidden, setIsShowingHidden] = useState(false);
  const { preferences, toggleFavorite, hide, restore } = useMarketPreferences();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleCurrencies = selectCurrencies(
    currencies,
    snapshot,
    preferences,
    search,
    filter,
    sortField,
    sortDirection,
  );
  const hiddenCurrencies = currencies.filter(({ symbol }) =>
    preferences.hidden.includes(symbol),
  );
  const hasPrices = Object.keys(snapshot.quotes).length > 0;
  const isConnected = snapshot.status === "connected";
  const isWaiting =
    !hasPrices &&
    (snapshot.status === "connecting" || snapshot.status === "reconnecting");
  const isUnavailable = !isConnected && snapshot.status !== "connecting";
  const latestUpdate = Math.max(
    0,
    ...Object.values(snapshot.quotes).map(({ receivedAt }) => receivedAt),
  );
  const age = latestUpdate
    ? Math.max(0, Math.floor((now - latestUpdate) / 1000))
    : null;
  const isQuoteStale = (symbol: string) =>
    !isConnected ||
    now - (snapshot.quotes[symbol]?.receivedAt ?? 0) >= STALE_TIMEOUT_MS;

  return (
    <SectionCard headingId="spot-market-heading" hasShadow>
      <Stack
        sx={{ borderColor: "divider" }}
        className="flex-row flex-wrap items-center justify-between gap-4 border-b p-5 sm:p-6"
      >
        <Stack className="flex-row items-center gap-3">
          <Typography component="h2" variant="h2" id="spot-market-heading">
            Spot markets
          </Typography>

          <AppChip
            label={`${currencies.length - hiddenCurrencies.length} visible`}
            isBrand
          />
        </Stack>

        <Typography color="textSecondary" variant="caption">
          Binance · USDT pairs
        </Typography>
      </Stack>

      <AppAlert
        aria-live="polite"
        severity={isUnavailable ? "warning" : isConnected ? "success" : "info"}
        icon={false}
        sx={{
          bgcolor: isUnavailable ? "warningSoft.main" : "background.default",
          borderColor: "divider",
        }}
        className="rounded-none border-b px-5 sm:px-6 [&_.MuiAlert-message]:w-full"
      >
        <Stack className="flex-row flex-wrap items-center justify-between gap-3">
          <Typography
            variant="body2"
            color={isUnavailable ? "warning" : "textSecondary"}
          >
            {snapshot.message ??
              (isConnected
                ? "Receiving market prices from Binance."
                : "Connecting to Binance. Waiting for the first prices…")}
            {isUnavailable &&
              hasPrices &&
              " Last-known prices are shown below."}
          </Typography>
          {isUnavailable && (
            <AppButton
              variant="outlined"
              size="small"
              onClick={onRetry}
              disabled={snapshot.status === "disconnected"}
              className="min-h-10"
            >
              Retry connection
            </AppButton>
          )}
        </Stack>
      </AppAlert>
      {alerts.length > 0 && (
        <Stack
          aria-label="Significant price alerts"
          sx={{ borderColor: "divider" }}
          className="gap-2 border-b p-5 sm:p-6"
        >
          {alerts.map((alert) => {
            const currency = AVAILABLE_CURRENCIES.find(
              ({ symbol }) => symbol === alert.symbol,
            );
            return (
              <AppAlert
                key={alert.id}
                role="alert"
                severity={
                  alert.direction === "increased" ? "success" : "warning"
                }
                onClose={() => onDismissAlert(alert.id)}
              >
                <Typography variant="body2Bold">
                  {currency?.name ?? alert.symbol} (
                  {currency?.ticker ?? alert.symbol}/USDT) {alert.direction} by{" "}
                  {Math.abs(alert.percentageChange).toFixed(2)}% since you
                  opened the page.
                </Typography>

                <Typography variant="caption">
                  Initial: {formatPrice(alert.initialPrice)} USDT · Current:{" "}
                  {formatPrice(alert.currentPrice)} USDT · Direction:{" "}
                  {alert.direction}
                </Typography>
              </AppAlert>
            );
          })}
        </Stack>
      )}
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
          onChange={(value) => setSortField(value as TSortField)}
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
      {visibleCurrencies.length === 0 ? (
        <Box role="status" className="px-5 py-12 text-center sm:px-6">
          <Typography component="h3" variant="spanBold">
            No currencies found
          </Typography>

          <Typography color="textSecondary" className="mt-1">
            Try another search, switch to All, or restore a hidden currency.
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer className="hidden md:block">
            <Table
              sx={{ "& .MuiTableCell-root": { borderColor: "divider" } }}
              className="table-fixed [&_.MuiTableCell-root]:px-6 [&_.MuiTableCell-root]:py-5 [&_.MuiTableCell-head]:py-4 [&_.MuiTableCell-head]:text-xs"
            >
              <Box component="caption" className="sr-only">
                Live cryptocurrency prices in USDT, latest tick direction,
                percentage change since opening, favorite status, and visibility
                actions.
              </Box>

              <TableHead>
                <TableRow>
                  <TableCell scope="col">Asset</TableCell>
                  <TableCell scope="col" align="right">
                    Price (USDT)
                  </TableCell>

                  <TableCell scope="col" align="right">
                    Change since opening
                  </TableCell>

                  <TableCell scope="col" align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleCurrencies.map((currency) => {
                  const isFavorite = preferences.favorites.includes(
                    currency.symbol,
                  );
                  return (
                    <TableRow
                      key={currency.symbol}
                      hover
                      className="last:[&_.MuiTableCell-root]:border-b-0"
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        aria-label={`${currency.name}, ${currency.ticker}/USDT`}
                      >
                        <Stack className="flex-row items-center gap-3">
                          <Avatar
                            aria-hidden="true"
                            sx={{
                              bgcolor: `${currency.badgeTone}.main`,
                              color: `${currency.badgeTone}.contrastText`,
                            }}
                            className="size-10 text-[10px] font-bold"
                          >
                            {currency.ticker}
                          </Avatar>

                          <Box>
                            <Typography component="p" variant="spanBold">
                              {currency.name}
                            </Typography>
                            <Typography color="textSecondary" variant="caption">
                              {currency.ticker}/USDT
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell align="right">
                        <MarketPrice
                          quote={snapshot.quotes[currency.symbol]}
                          isStale={isQuoteStale(currency.symbol)}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <SessionChange
                          quote={snapshot.quotes[currency.symbol]}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Stack className="flex-row items-center justify-end gap-1">
                          <Tooltip
                            title={
                              isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            <IconButton
                              size="small"
                              color={isFavorite ? "primary" : "default"}
                              aria-label={`${isFavorite ? "Remove" : "Add"} ${currency.name} ${isFavorite ? "from" : "to"} favorites`}
                              aria-pressed={isFavorite}
                              onClick={() => toggleFavorite(currency.symbol)}
                            >
                              <FavoriteIcon size={20} isFilled={isFavorite} />
                            </IconButton>
                          </Tooltip>

                          <AppButton
                            size="small"
                            onClick={() => hide(currency.symbol)}
                            aria-label={`Hide ${currency.name}`}
                          >
                            Hide
                          </AppButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <List
            aria-label="Cryptocurrency markets"
            disablePadding
            className="block md:hidden"
          >
            {visibleCurrencies.map((currency) => {
              const isFavorite = preferences.favorites.includes(
                currency.symbol,
              );
              return (
                <ListItem
                  key={currency.symbol}
                  divider
                  className="block p-5 last:border-b-0"
                >
                  <Stack className="flex-row items-center justify-between gap-2">
                    <Stack className="min-w-0 flex-row items-center gap-2">
                      <Avatar
                        aria-hidden="true"
                        sx={{
                          bgcolor: `${currency.badgeTone}.main`,
                          color: `${currency.badgeTone}.contrastText`,
                        }}
                        className="size-9 text-[9px] font-bold"
                      >
                        {currency.ticker}
                      </Avatar>

                      <Box>
                        <Typography component="p" variant="spanBold">
                          {currency.name}
                        </Typography>
                        <Typography color="textSecondary" variant="caption">
                          {currency.ticker}/USDT
                        </Typography>
                      </Box>
                    </Stack>

                    <MarketPrice
                      quote={snapshot.quotes[currency.symbol]}
                      isStale={isQuoteStale(currency.symbol)}
                    />
                  </Stack>

                  <Stack className="mt-4 flex-row items-center justify-between gap-2">
                    <Typography color="textSecondary" variant="caption">
                      Since opening
                    </Typography>

                    <SessionChange quote={snapshot.quotes[currency.symbol]} />
                  </Stack>

                  <Stack className="mt-3 flex-row items-center justify-end gap-2">
                    <Tooltip
                      title={
                        isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <IconButton
                        size="small"
                        color={isFavorite ? "primary" : "default"}
                        aria-label={`${isFavorite ? "Remove" : "Add"} ${currency.name} ${isFavorite ? "from" : "to"} favorites`}
                        aria-pressed={isFavorite}
                        onClick={() => toggleFavorite(currency.symbol)}
                      >
                        <FavoriteIcon size={20} isFilled={isFavorite} />
                      </IconButton>
                    </Tooltip>

                    <AppButton
                      size="small"
                      onClick={() => hide(currency.symbol)}
                      aria-label={`Hide ${currency.name}`}
                    >
                      Hide
                    </AppButton>
                  </Stack>
                </ListItem>
              );
            })}
          </List>
        </>
      )}
      <Stack
        color="text.secondary"
        sx={{ bgcolor: "background.default", borderColor: "divider" }}
        className="flex-row flex-wrap justify-between gap-2 border-t px-5 py-4 sm:px-6"
      >
        <Typography variant="caption">
          Arrows beside prices show the latest tick. Percentages compare with
          your first session price.
        </Typography>

        <Typography variant="caption">
          {age === null
            ? isWaiting
              ? "Waiting for market data"
              : "No prices received"
            : `Last update ${age < 2 ? "just now" : `${age}s ago`}`}
        </Typography>
      </Stack>
    </SectionCard>
  );
}
