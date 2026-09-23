import type { SVGProps } from 'react'

export type TSVGIconProps = Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> & {
  width: number
  height: number
}
