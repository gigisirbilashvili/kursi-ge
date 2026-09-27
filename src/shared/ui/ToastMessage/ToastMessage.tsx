import type { IToastMessageProps } from './types'

export function ToastMessage({ message, title }: IToastMessageProps) {
  return (
    <div className="min-w-0 break-words">
      {title && <div className="mb-1 font-semibold">{title}</div>}
      <div>{message}</div>
    </div>
  )
}
