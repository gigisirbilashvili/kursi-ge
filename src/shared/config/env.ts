const streamEndpoint = import.meta.env.VITE_MARKET_STREAM_ENDPOINT?.trim()

if (!streamEndpoint) {
  throw new Error('VITE_MARKET_STREAM_ENDPOINT is required')
}

export const env = {
  streamEndpoint,
}
