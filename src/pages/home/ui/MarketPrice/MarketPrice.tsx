import { Box, Skeleton, Stack, Tooltip, Typography } from "@mui/material";

import { useMarketPriceModel } from '../../model/useMarketPriceModel'
import { ArrowIcon } from "../../../../assets/icons";
import type { IMarketPriceProps } from "./types";

export function MarketPrice({ symbol }: IMarketPriceProps) {
  const {
    isWaiting,
    isStale,
    direction,
    color,
    priceText,
    tickTitle,
    tickText,
  } = useMarketPriceModel(symbol)
  if (isWaiting) {
    return (
      <Stack className="items-end">
        <Skeleton className="h-6 w-24 motion-reduce:animate-none motion-reduce:after:animate-none" />

        <Typography color="textSecondary" variant="caption">
          Awaiting price
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack className="items-end gap-1">
      <Stack className="flex-row items-center gap-2">
        <Tooltip title={tickTitle}>
          <Box
            component="span"
            color={color}
            className="inline-flex w-4 shrink-0"
          >
            <ArrowIcon width={16} height={20} direction={direction} />

            <Box component="span" className="sr-only">
              {tickText}
            </Box>
          </Box>
        </Tooltip>

        <Typography
          component="span"
          variant="body2Bold"
          className="min-w-[10ch] text-right tabular-nums"
        >
          {priceText}
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
