import type { ReactNode } from 'react'

type ViewerHeaderProps = {
  label: string
  filename: string
  badge: string
  badgeClass: string
  children?: ReactNode
}

export function ViewerHeader({ label, filename, badge, badgeClass, children }: ViewerHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-2">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <span className={`rounded px-1.5 py-0.5 font-mono text-xs font-medium ${badgeClass}`}>{badge}</span>
      <span className="font-mono text-xs text-gray-400">{filename}</span>
      {children}
    </div>
  )
}
