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
      slotProps={{
        select: {
          onClose: shouldRestoreFocus
            ? () => selectRef.current?.querySelector<HTMLElement>('[role="combobox"]')?.focus()
            : undefined,
          MenuProps: {
            ['disableScrollLock']: true,
            ['disableEnforceFocus']: shouldRestoreFocus,
          },
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )
}
