import type { IArrowIconProps } from './types'

export function ArrowIcon({
  size = 24,
  width = size,
  height = size,
  direction,
  color = 'currentColor',
  ...props
}: IArrowIconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      {...props}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={
          direction === 'unchanged'
            ? 'M5 12h14'
            : direction === 'up'
              ? 'M12 20V4m-7 7 7-7 7 7'
              : 'M12 4v16m-7-7 7 7 7-7'
        }
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
