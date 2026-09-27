import type { ReactNode } from 'react'

export interface IStatusTextProps {
  children: ReactNode
  tone?: 'muted' | 'warning'
  variant?: 'body1' | 'body2' | 'caption'
  className?: string
}
