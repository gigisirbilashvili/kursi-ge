import { describe, afterEach, expect, jest, test } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'

import { notify } from './notify'
import { useStoredState } from './useStoredState'

describe('useStoredState', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    localStorage.clear()
  })

  const parse = (value: string | null): string[] => JSON.parse(value ?? '[]') as string[]

  test('should keep state usable and report failed storage writes', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked') })
    const error = jest.spyOn(notify, 'error').mockReturnValue('storage-unavailable')
    const { result } = renderHook(() => useStoredState('test-settings', parse))

    act(() => result.current[1](['BTCUSDT']))

    expect(result.current[0]).toEqual(['BTCUSDT'])
    expect(error).toHaveBeenCalledWith(expect.stringContaining('may not be saved'), { toastId: 'storage-unavailable' })
  })

  test('should restore defaults and warn when saved settings are malformed', () => {
    localStorage.setItem('test-settings', 'not-json')
    const warning = jest.spyOn(notify, 'warning').mockReturnValue('invalid-settings')
    const { result } = renderHook(() => useStoredState('test-settings', parse))

    expect(result.current[0]).toEqual([])
    expect(warning).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('test-settings')).toBe('[]')
  })

  test('should report failed storage reads without crashing', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked') })
    const error = jest.spyOn(notify, 'error').mockReturnValue('storage-unavailable')
    const { result } = renderHook(() => useStoredState('test-settings', parse))

    expect(result.current[0]).toEqual([])
    expect(error).toHaveBeenCalledTimes(1)
  })
})
