import type { IMarketSocket } from '../types/index.ts'

export function createBrowserSocket(url: string): IMarketSocket {
  const nativeSocket = new WebSocket(url)
  const socket: IMarketSocket = {
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
    close() {
      nativeSocket.onopen = null
      nativeSocket.onmessage = null
      nativeSocket.onclose = null
      nativeSocket.onerror = null
      nativeSocket.close()
    },
  }
  nativeSocket.onopen = () => socket.onopen?.()
  nativeSocket.onmessage = (event) => {
    const data: unknown = event.data
    socket.onmessage?.(data)
  }
  nativeSocket.onclose = () => socket.onclose?.()
  nativeSocket.onerror = () => socket.onerror?.()
  return socket
}
