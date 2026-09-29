export interface ISessionChangeViewState {
  isUnavailable: boolean
  color: 'positiveSoft' | 'negativeSoft' | 'neutralSoft'
  direction: 'up' | 'down' | 'unchanged'
  label: string
  title: string
}
