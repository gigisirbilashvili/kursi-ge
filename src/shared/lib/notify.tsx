import { toast } from 'react-toastify'
import type { ToastOptions } from 'react-toastify'

import { ToastMessage } from '../ui/ToastMessage/ToastMessage'

export const notify = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(<ToastMessage message={message} />, { role: 'status', ...options }),
  error: (message: string, options?: ToastOptions) =>
    toast.error(<ToastMessage title="Something went wrong" message={message} />, options),
  warning: (message: string, options?: ToastOptions) =>
    toast.warning(<ToastMessage message={message} />, options),
  info: (message: string, options?: ToastOptions) =>
    toast.info(<ToastMessage message={message} />, { role: 'status', ...options }),
  dismiss: (id: string) => toast.dismiss(id),
}
