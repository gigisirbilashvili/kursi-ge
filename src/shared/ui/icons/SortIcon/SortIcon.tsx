import type { ISortIconProps } from './types'

export function SortIcon({ width, height, color = 'currentColor', ...props }: ISortIconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      {...props}
      width={width}
      height={height}
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.5 5H5.00063L5 12.5H3.75V5H1.25L4.375 1.875L7.5 5ZM13.75 10L10.625 13.125L7.5 10H10V2.5H11.25V10H13.75Z"
        fill={color}
      />
    </svg>
  )
}
