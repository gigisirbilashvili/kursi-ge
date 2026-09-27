import { toast } from 'react-toastify'
import type { ToastOptions } from 'react-toastify'

import { ToastMessage } from '../ui/ToastMessage/ToastMessage'

type TNotificationType = 'success' | 'error' | 'warning' | 'info'

function show(type: TNotificationType, message: string, options?: ToastOptions) {
  const toastId = options?.toastId ?? `${type}:${message}`
  const role = options?.role ?? (type === 'success' || type === 'info' ? 'status' : 'alert')
  const content = (
    <ToastMessage title={type === 'error' ? 'Something went wrong' : undefined} message={message} />
  )

  if (toast.isActive(toastId)) {
    toast.update(toastId, {
      ...options,
      render: content,
      type,
      role,
      autoClose: options?.autoClose ?? null,
    })
    return toastId
  }

  return toast(content, { ...options, toastId, type, role })
}

export const notify = {
  success: (message: string, options?: ToastOptions) => show('success', message, options),
  error: (message: string, options?: ToastOptions) => show('error', message, options),
  warning: (message: string, options?: ToastOptions) => show('warning', message, options),
  info: (message: string, options?: ToastOptions) => show('info', message, options),
  dismiss: (id: string) => toast.dismiss(id),
}
