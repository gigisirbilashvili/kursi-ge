import { useEffect, useState } from 'react'

import { notify } from './notify'
import { readStorage, reportStorageError, writeStorage } from './storage'

export function useStoredState<T>(
  key: string,
  parse: (value: string | null) => T,
  serialize: (value: T) => string = JSON.stringify,
) {
  const [initial] = useState(() => {
    const stored = readStorage(key)
    try {
      return { ...stored, parsed: parse(stored.value), hasInvalidData: false }
    } catch {
      return { ...stored, parsed: parse(null), hasInvalidData: true }
    }
  })
  const [value, setValue] = useState(initial.parsed)

  useEffect(() => {
    if (initial.hasError) reportStorageError()
    if (initial.hasInvalidData) {
      notify.warning('Some saved settings could not be read. Defaults have been restored.', {
        toastId: `storage-invalid:${key}`,
      })
    }
  }, [initial, key])

  useEffect(() => {
    writeStorage(key, serialize(value))
  }, [key, serialize, value])

  return [value, setValue] as const
}
