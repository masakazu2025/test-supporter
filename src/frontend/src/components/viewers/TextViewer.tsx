import type React from 'react'
import { ViewerHeader } from './ViewerHeader'

// ================================================================
// TextViewer — プレーンテキスト表示
// ================================================================

export type TextViewerConfig = {
  fontFamily?: 'mono' | 'sans' | 'ms-gothic' | 'ms-pgothic' | 'ui'
  fontSize?: 'xs' | 'sm' | 'base'
  lineHeight?: 'tight' | 'normal' | 'relaxed'
  wordWrap?: boolean
  width?: string  // 白背景エリア幅 例: '360px', '42ch'。未指定でフル幅
}

type TextViewerProps = {
  label: string
  filename: string
  content: string
  config?: TextViewerConfig
}

// Tailwind クラスで対応できるフォント
const FONT_CLASS: Partial<Record<NonNullable<TextViewerConfig['fontFamily']>, string>> = {
  mono: 'font-mono',
  sans: 'font-sans',
}

// インラインスタイルが必要なフォント
const FONT_STYLE: Partial<Record<NonNullable<TextViewerConfig['fontFamily']>, string>> = {
  'ms-gothic':  "'MS Gothic', 'MS ゴシック', monospace",
  'ms-pgothic': "'MS PGothic', 'MS Pゴシック', sans-serif",
  'ui':         'ui-sans-serif, system-ui, sans-serif',
}

const FONT_SIZE: Record<NonNullable<TextViewerConfig['fontSize']>, string> = {
  xs:   'text-xs',
  sm:   'text-sm',
  base: 'text-base',
}
const LINE_HEIGHT: Record<NonNullable<TextViewerConfig['lineHeight']>, string> = {
  tight:   'leading-tight',
  normal:  'leading-normal',
  relaxed: 'leading-relaxed',
}

export function TextViewer({ label, filename, content, config }: TextViewerProps) {
  const family     = config?.fontFamily ?? 'mono'
  const fontSize   = FONT_SIZE[config?.fontSize ?? 'xs']
  const lineHeight = LINE_HEIGHT[config?.lineHeight ?? 'relaxed']
  const wordWrap   = config?.wordWrap ?? true
  const width      = config?.width

  const fontClass = FONT_CLASS[family] ?? ''
  const fontStyle: React.CSSProperties = {
    ...(FONT_STYLE[family] ? { fontFamily: FONT_STYLE[family] } : {}),
  }

  return (
    <div className="flex h-full overflow-auto">
      {/* width指定時: 紙サイズの白背景エリアを中央寄せ。未指定: フル幅 */}
      <div
        className="flex shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
        style={width ? { width } : { flex: 1 }}
      >
        <ViewerHeader label={label} filename={filename} badge="TEXT" badgeClass="bg-gray-100 text-gray-600" />
        <pre
          className={`flex-1 overflow-auto p-4 ${fontClass} ${fontSize} ${lineHeight} text-gray-700 ${wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'}`}
          style={fontStyle}
        >
          {content}
        </pre>
      </div>
    </div>
  )
}
