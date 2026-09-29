import { describe, afterEach, expect, test } from '@jest/globals'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import { toast } from 'react-toastify'

import { notify } from '../../../shared/lib/notify'
import { Toaster } from '../../../shared/ui/Toaster/Toaster'
import { useSelectedPairs } from './useSelectedPairs'

describe('useSelectedPairs', () => {
  afterEach(() => {
    toast.dismiss()
    toast.clearWaitingQueue()
    localStorage.clear()
  })

  test('should show only the latest pair change after rapid actions', async () => {
    localStorage.setItem('kursi-selected-pairs-v1', JSON.stringify(['BTCUSDT']))
    render(<Toaster mode="light" />)
    const { result } = renderHook(() => useSelectedPairs())

    act(() => {
      notify.warning('Other alert 1', { toastId: 'other-1' })
      notify.warning('Other alert 2', { toastId: 'other-2' })
      notify.warning('Other alert 3', { toastId: 'other-3' })
      result.current.addPair('ADAUSDT')
      result.current.addPair('DOGEUSDT')
      result.current.removePair('ADAUSDT')
    })

    expect(result.current.symbols).toEqual(['BTCUSDT', 'DOGEUSDT'])
    await waitFor(() =>
      expect(document.getElementById('pair-change')).toHaveTextContent('ADA/USDT removed.'),
    )
    expect(document.querySelectorAll('#pair-change')).toHaveLength(1)
    expect(screen.getAllByRole('alert')).toHaveLength(3)
    expect(screen.queryByText('ADA/USDT added.')).not.toBeInTheDocument()
    expect(screen.queryByText('DOGE/USDT added.')).not.toBeInTheDocument()
  })

  test('should keep the final pair when removals happen before a rerender', async () => {
    localStorage.setItem('kursi-selected-pairs-v1', JSON.stringify(['BTCUSDT', 'ETHUSDT']))
    render(<Toaster mode="light" />)
    const { result } = renderHook(() => useSelectedPairs())

    act(() => {
      result.current.removePair('BTCUSDT')
      result.current.removePair('ETHUSDT')
    })

    expect(result.current.symbols).toEqual(['ETHUSDT'])
    expect(await screen.findByRole('alert')).toHaveTextContent('Keep at least one currency pair tracked.')
  })
})
