import { ViewerHeader } from './ViewerHeader'

// ================================================================
// JsonViewer — JSON表示
// ================================================================

export type JsonViewerConfig = {
  fontSize?: 'xs' | 'sm'
  indent?: number
}

type JsonViewerProps = {
  label: string
  filename: string
  data: unknown
  config?: JsonViewerConfig
}

const FONT_SIZE: Record<NonNullable<JsonViewerConfig['fontSize']>, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
}

export function JsonViewer({ label, filename, data, config }: JsonViewerProps) {
  const fontSize = FONT_SIZE[config?.fontSize ?? 'xs']
  const indent = config?.indent ?? 2

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <ViewerHeader label={label} filename={filename} badge="JSON" badgeClass="bg-amber-100 text-amber-700" />
      <pre className={`flex-1 overflow-auto p-4 font-mono ${fontSize} leading-relaxed text-gray-700`}>
        {JSON.stringify(data, null, indent)}
      </pre>
    </div>
  )
}
