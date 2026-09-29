export interface ITargetAlertItemProps {
  title: string
  statusText: string
  hasTriggered: boolean
  rearmLabel: string
  removeLabel: string
  onRearm: () => void
  onRemove: () => void
}
