import type { TSVGIconProps } from '../../../../shared/types/svg'

export type IArrowIconProps = TSVGIconProps & {
  direction: 'up' | 'down' | 'unchanged'
}
