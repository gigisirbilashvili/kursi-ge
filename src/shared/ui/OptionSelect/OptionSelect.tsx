import { useRef } from 'react'
import { MenuItem, TextField } from '@mui/material'

import type { IOptionSelectProps } from './types'

export function OptionSelect({
  label,
  value,
  options,
  onChange,
  className,
  shouldRestoreFocus = false,
}: IOptionSelectProps) {
  const selectRef = useRef<HTMLDivElement>(null)

  return (
    <TextField
      ref={selectRef}
      select
      label={label}
      value={value}
      size="small"
      onChange={(event) => onChange(event.target.value)}
      className={className}
      slotProps={
        shouldRestoreFocus
          ? {
              select: {
                onClose: () =>
                  selectRef.current?.querySelector<HTMLElement>('[role="combobox"]')?.focus(),
                MenuProps: { ['disableEnforceFocus']: true },
              },
            }
          : undefined
      }
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )
}
