import { describe, expect, test } from '@jest/globals'

import { addSelectedPair, readSelectedSymbols, removeSelectedPair } from './selectedPairs'

describe('addSelectedPair', () => {
  test('should reject unsupported and duplicate pairs without changing the selection', () => {
    const selected = ['BTCUSDT']
    expect(addSelectedPair(selected, 'UNKNOWN')).toEqual({ status: 'unsupported' })
    expect(addSelectedPair(selected, 'BTCUSDT')).toEqual({ status: 'duplicate' })
    expect(addSelectedPair(selected, 'ETHUSDT')).toEqual({
      status: 'added', symbols: ['BTCUSDT', 'ETHUSDT'], ticker: 'ETH',
    })
    expect(selected).toEqual(['BTCUSDT'])
  })
})

describe('removeSelectedPair', () => {
  test('should retain the final pair and ignore removal of an unselected pair', () => {
    expect(removeSelectedPair(['BTCUSDT'], 'BTCUSDT')).toEqual({ status: 'last-pair' })
    expect(removeSelectedPair(['BTCUSDT'], 'ETHUSDT')).toEqual({ status: 'absent' })
    expect(removeSelectedPair(['BTCUSDT', 'ETHUSDT'], 'BTCUSDT')).toEqual({
      status: 'removed', symbols: ['ETHUSDT'], ticker: 'BTC',
    })
  })
})

describe('readSelectedSymbols', () => {
  test('should normalize saved pairs and fall back to defaults for empty selections', () => {
    expect(readSelectedSymbols('["ETHUSDT","UNKNOWN","ETHUSDT"]')).toEqual(['ETHUSDT'])
    expect(readSelectedSymbols('[]')).toEqual(readSelectedSymbols(null))
    expect(() => readSelectedSymbols('invalid json')).toThrow()
  })
})
