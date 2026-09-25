import { notify } from './notify'

export function readStorage(key: string) {
  try {
    return { value: localStorage.getItem(key), hasError: false }
  } catch {
    return { value: null, hasError: true }
  }
}

export function reportStorageError() {
  notify.error('Device storage is unavailable. Your changes work for this session but may not be saved.', {
    toastId: 'storage-unavailable',
  })
}

export function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    reportStorageError()
    return false
  }
}
