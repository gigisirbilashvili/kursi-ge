import type { TSVGIconProps } from '../../../../types/svg'

export type IArrowIconProps = TSVGIconProps & {
  direction: 'up' | 'down' | 'unchanged'
}
