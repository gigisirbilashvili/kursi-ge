import { Alert } from '@mui/material'

import type { IAppAlertProps } from './types'

export function AppAlert({ role = 'status', ...props }: IAppAlertProps) {
  return <Alert role={role} {...props} />
}
