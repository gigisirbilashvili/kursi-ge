import { ToastContainer } from 'react-toastify'

import type { IToasterProps } from './types'

export function Toaster({ mode }: IToasterProps) {
  return (
    <ToastContainer
      position="top-right"
      autoClose={6000}
      limit={3}
      theme={mode}
      pauseOnHover
      pauseOnFocusLoss
      closeOnClick={false}
      aria-label="Notifications"
    />
  )
}
