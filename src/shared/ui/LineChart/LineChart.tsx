import type { ILineChartProps } from './types'

export function LineChart({
  points,
  size,
  width = size ?? 800,
  height = size ?? 200,
  color = 'currentColor',
  ...props
}: ILineChartProps) {
  return (
    <svg
      role="img"
      focusable="false"
      preserveAspectRatio="none"
      {...props}
      width={width}
      height={height}
      viewBox="0 0 800 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1={16} x2={784} y1={180} y2={180} stroke="currentColor" className="text-border" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
