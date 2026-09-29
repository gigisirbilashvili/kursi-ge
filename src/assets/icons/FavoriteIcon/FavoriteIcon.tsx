import type { IFavoriteIconProps } from './types'

export function FavoriteIcon({
  size = 24,
  width = size,
  height = size,
  isFilled = false,
  color = 'currentColor',
  ...props
}: IFavoriteIconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      {...props}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={isFilled ? color : 'none'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m12 2.75 2.84 5.75 6.35.92-4.59 4.48 1.08 6.32L12 17.24l-5.68 2.98 1.08-6.32-4.59-4.48 6.35-.92L12 2.75Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}
