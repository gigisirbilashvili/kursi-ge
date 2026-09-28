import { useEffect, useState } from 'react'
import { Box, Skeleton, Stack, Tooltip, Typography } from "@mui/material";

import { useMarketQuote, useMarketStatus, STALE_TIMEOUT_MS } from '../../../../entities/currency';
import { ArrowIcon } from "../../../../assets/icons";
import { formatPrice } from "../../lib/formatPrice";
import type { IMarketPriceProps } from "./types";

export function MarketPrice({ symbol }: Readonly<IMarketPriceProps>) {
  const quote = useMarketQuote(symbol)
  const status = useMarketStatus()
  const [now, setNow] = useState(Date.now)
  const receivedAt = quote?.receivedAt
  useEffect(() => {
    if (receivedAt === undefined) return
    const timer = window.setTimeout(() => setNow(Date.now()), Math.max(0, receivedAt + STALE_TIMEOUT_MS - Date.now()))
    return () => window.clearTimeout(timer)
  }, [receivedAt])
  const isStale = status !== 'connected' || now - (receivedAt ?? 0) >= STALE_TIMEOUT_MS
  if (!quote) {
    return (
      <Stack className="items-end">
        <Skeleton className="h-6 w-24 motion-reduce:animate-none motion-reduce:after:animate-none" />

        <Typography color="textSecondary" variant="caption">
          Awaiting price
        </Typography>
      </Stack>
    );
  }

  let color = "text.secondary";

  if (quote.direction === "up") {
    color = "success.main";
  } else if (quote.direction === "down") {
    color = "error.main";
  }

  return (
    <Stack className="items-end gap-1">
      <Stack className="flex-row items-center gap-2">
        <Tooltip title={`Latest tick: ${quote.direction}`}>
          <Box
            component="span"
            color={color}
            className="inline-flex w-4 shrink-0"
          >
            <ArrowIcon width={16} height={20} direction={quote.direction} />

            <Box component="span" className="sr-only">
              Latest tick {quote.direction}.{" "}
            </Box>
          </Box>
        </Tooltip>

        <Typography
          component="span"
          variant="body2Bold"
          className="min-w-[10ch] text-right tabular-nums"
        >
          {formatPrice(quote.price)}
        </Typography>
      </Stack>
      {isStale && (
        <Typography color="warning" variant="caption">
          Last-known price
        </Typography>
      )}
    </Stack>
  );
}
