import type { IMarketSocket, TMarketSocketData } from '../types/index.ts'

export function createBrowserSocket(url: string): IMarketSocket {
  const nativeSocket = new WebSocket(url)
  const socket: IMarketSocket = {
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
    send(message) {
      nativeSocket.send(message)
    },
    close() {
      nativeSocket.onopen = null
      nativeSocket.onmessage = null
      nativeSocket.onclose = null
      nativeSocket.onerror = null
      nativeSocket.close()
    },
  }
  nativeSocket.onopen = () => socket.onopen?.()
  nativeSocket.onmessage = (event: MessageEvent<TMarketSocketData>) => {
    socket.onmessage?.(event.data)
  }
  nativeSocket.onclose = () => socket.onclose?.()
  nativeSocket.onerror = () => socket.onerror?.()
  return socket
}
