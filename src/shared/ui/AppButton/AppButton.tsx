import { Button } from '@mui/material'

import type { IAppButtonProps } from './types'

export function AppButton({ type = 'button', ...props }: IAppButtonProps) {
  return <Button type={type} {...props} />
}
