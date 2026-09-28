import { Tooltip, Typography } from "@mui/material";

import { AppChip } from "../../../../shared/ui/AppChip/AppChip";
import { ArrowIcon } from "../../../../assets/icons";
import { formatPrice } from "../../lib/formatPrice";
import type { ISessionChangeProps } from "./types";

export function SessionChange({ quote }: ISessionChangeProps) {
  if (!quote)
    return (
      <Typography
        color="textSecondary"
        component="span"
        aria-label="Session change unavailable"
      >
        —
      </Typography>
    );
  const change = quote.percentageChange;
  const formatted =
    change !== 0 && Math.abs(change) < 0.0001
      ? `${change > 0 ? "+" : "-"}<0.0001`
      : new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: Math.abs(change) < 0.01 ? 4 : 2,
          signDisplay: "exceptZero",
        }).format(change);
  const color =
    change > 0 ? "positiveSoft" : change < 0 ? "negativeSoft" : "neutralSoft";
  return (
    <Tooltip
      title={`Since the first session price of ${formatPrice(quote.initialPrice)} USDT`}
    >
      <AppChip
        color={color}
        icon={
          <ArrowIcon
            width={16}
            height={18}
            direction={change > 0 ? "up" : change < 0 ? "down" : "unchanged"}
          />
        }
        label={`${formatted}%`}
        className="h-7 text-xs font-semibold tabular-nums [&_.MuiChip-icon]:ml-2"
      />
    </Tooltip>
  );
}
