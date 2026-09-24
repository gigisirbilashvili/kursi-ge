export type TConversionResult =
  | { status: 'ready'; amount: number; rate: number; value: number }
  | { status: 'empty' | 'invalid' | 'waiting' | 'stale'; message: string }
