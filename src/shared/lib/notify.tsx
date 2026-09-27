import { toast } from 'react-toastify'
import type { ToastOptions } from 'react-toastify'

import { ToastMessage } from '../ui/ToastMessage/ToastMessage'
import { LATEST_SUCCESS_CONTAINER_ID } from './toastContainers'

export const notify = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(<ToastMessage message={message} />, { role: 'status', ...options }),
  successLatest: (message: string, toastId: string) => {
    const content = <ToastMessage message={message} />
    if (toast.isActive(toastId, LATEST_SUCCESS_CONTAINER_ID)) {
      toast.update(toastId, {
        render: content,
        autoClose: null,
        containerId: LATEST_SUCCESS_CONTAINER_ID,
      })
      return
    }
    toast.success(content, {
      toastId,
      role: 'status',
      containerId: LATEST_SUCCESS_CONTAINER_ID,
    })
  },
  error: (message: string, options?: ToastOptions) =>
    toast.error(<ToastMessage title="Something went wrong" message={message} />, options),
  warning: (message: string, options?: ToastOptions) =>
    toast.warning(<ToastMessage message={message} />, options),
  info: (message: string, options?: ToastOptions) =>
    toast.info(<ToastMessage message={message} />, { role: 'status', ...options }),
  dismiss: (id: string) => toast.dismiss(id),
}
