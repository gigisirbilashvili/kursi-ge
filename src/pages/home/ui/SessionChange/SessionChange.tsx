import { Tooltip, Typography } from "@mui/material";

import { useSessionChangeModel } from '../../model/useSessionChangeModel'
import { AppChip } from "../../../../shared/ui/AppChip/AppChip";
import { ArrowIcon } from "../../../../assets/icons";
import type { ISessionChangeProps } from "./types";

export function SessionChange({ symbol }: ISessionChangeProps) {
  const {
    isUnavailable,
    color,
    direction,
    label,
    title,
  } = useSessionChangeModel(symbol)
  if (isUnavailable)
    return (
      <Typography
        color="textSecondary"
        component="span"
        aria-label="Session change unavailable"
      >
        —
      </Typography>
    );
  return (
    <Tooltip
      title={title}
    >
      <AppChip
        color={color}
        icon={
          <ArrowIcon
            width={16}
            height={18}
            direction={direction}
          />
        }
        label={label}
        className="h-7 text-xs font-semibold tabular-nums [&_.MuiChip-icon]:ml-2"
      />
    </Tooltip>
  );
}
