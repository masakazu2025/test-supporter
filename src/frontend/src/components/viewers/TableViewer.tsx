import { useState, useEffect } from 'react'
import { ViewerHeader } from './ViewerHeader'

// ================================================================
// TableViewer — テーブル表示（列フィルタ・全体フィルタ対応）
// ================================================================

export type ColumnDef = {
  key: string
  label: string
  width?: string
  align?: 'left' | 'right' | 'center'
  render?: (value: string, row: Record<string, string>) => React.ReactNode
}

export type TableViewerConfig = {
  columns: ColumnDef[]
  fontSize?: 'xs' | 'sm'
  stickyHeader?: boolean
}

type TableViewerProps = {
  label: string
  filename: string
  rows: Record<string, string>[]
  config: TableViewerConfig
}

const FONT_SIZE: Record<NonNullable<TableViewerConfig['fontSize']>, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
}

export function TableViewer({ label, filename, rows, config }: TableViewerProps) {
  const [globalFilter, setGlobalFilter]   = useState('')
  const [columnFilters, setColumnFilters] = useState<Map<string, Set<string>>>(new Map())
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null)

  const fontSize = FONT_SIZE[config.fontSize ?? 'sm']
  const sticky   = config.stickyHeader !== false

  // ---- 絞り込みロジック ----

  /** 指定列を除く全フィルタを適用した行を返す（カスケード用） */
  const getCandidateRows = (excludeKey: string): Record<string, string>[] =>
    rows.filter((row) => {
      if (globalFilter.trim()) {
        const hit = Object.values(row).some((v) =>
          v.toLowerCase().includes(globalFilter.toLowerCase())
        )
        if (!hit) return false
      }
      for (const [key, selected] of columnFilters) {
        if (key === excludeKey || selected.size === 0) continue
        if (!selected.has(row[key] ?? '')) return false
      }
      return true
    })

  /** 全フィルタを適用した行 */
  const filteredRows = rows.filter((row) => {
    if (globalFilter.trim()) {
      const hit = Object.values(row).some((v) =>
        v.toLowerCase().includes(globalFilter.toLowerCase())
      )
      if (!hit) return false
    }
    for (const [key, selected] of columnFilters) {
      if (selected.size === 0) continue
      if (!selected.has(row[key] ?? '')) return false
    }
    return true
  })

  const applyColumnFilter = (key: string, values: Set<string>) => {
    setColumnFilters((prev) => {
      const next = new Map(prev)
      if (values.size === 0) next.delete(key)
      else next.set(key, values)
      return next
    })
  }

  const clearColumnFilter = (key: string) => {
    setColumnFilters((prev) => {
      const next = new Map(prev)
      next.delete(key)
      return next
    })
  }

  const activeFilterCount = columnFilters.size + (globalFilter.trim() ? 1 : 0)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <ViewerHeader label={label} filename={filename} badge="TABLE" badgeClass="bg-blue-100 text-blue-700">
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
            {activeFilterCount}
          </span>
        )}
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="全体フィルタ..."
          className="ml-auto rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 w-36"
        />
      </ViewerHeader>

      <div className="flex-1 overflow-auto">
        <table className={`w-full ${fontSize}`} style={{ tableLayout: 'fixed' }}>
          <colgroup>
            {config.columns.map((col) => (
              <col key={col.key} style={{ width: col.width }} />
            ))}
          </colgroup>
          <thead className={sticky ? 'sticky top-0 z-10 bg-gray-50' : 'bg-gray-50'}>
            <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500">
              {config.columns.map((col) => {
                const candidateRows = getCandidateRows(col.key)
                return (
                  <th
                    key={col.key}
                    className="px-3 py-2"
                    style={{ textAlign: col.align ?? 'left' }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="flex-1 truncate">{col.label}</span>
                      <ColumnFilterButton
                        columnKey={col.key}
                        candidateRows={candidateRows}
                        activeFilter={columnFilters.get(col.key)}
                        isOpen={openFilterKey === col.key}
                        onToggle={() =>
                          setOpenFilterKey(openFilterKey === col.key ? null : col.key)
                        }
                        onClose={() => setOpenFilterKey(null)}
                        onApply={(values) => {
                          // カスケード: 候補値をすべて選択 = フィルタなし
                          const allCandidateVals = [
                            ...new Set(candidateRows.map((r) => r[col.key] ?? '')),
                          ]
                          const isAll = allCandidateVals.every((v) => values.has(v))
                          if (isAll) clearColumnFilter(col.key)
                          else applyColumnFilter(col.key, values)
                          setOpenFilterKey(null)
                        }}
                        onClear={() => {
                          clearColumnFilter(col.key)
                          setOpenFilterKey(null)
                        }}
                      />
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td
                  colSpan={config.columns.length}
                  className="px-3 py-6 text-center text-xs text-gray-400"
                >
                  {globalFilter || columnFilters.size > 0 ? '該当なし' : 'データなし'}
                </td>
              </tr>
            )}
            {filteredRows.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                {config.columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-3 py-2 text-gray-700"
                    style={{ textAlign: col.align ?? 'left' }}
                  >
                    {col.render ? col.render(row[col.key] ?? '', row) : (row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRows.length > 0 && (
          <div className="border-t border-gray-100 px-3 py-1.5 text-xs text-gray-400">
            {filteredRows.length} 件
            {(globalFilter || columnFilters.size > 0) && ` / ${rows.length} 件中`}
          </div>
        )}
      </div>
    </div>
  )
}

// ================================================================
// 列フィルタボタン + ポップオーバー
// ================================================================

type ColumnFilterButtonProps = {
  columnKey: string
  /** 他の列フィルタ適用後の候補行（カスケード） */
  candidateRows: Record<string, string>[]
  activeFilter: Set<string> | undefined
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onApply: (values: Set<string>) => void
  onClear: () => void
}

function ColumnFilterButton({
  columnKey,
  candidateRows,
  activeFilter,
  isOpen,
  onToggle,
  onClose,
  onApply,
  onClear,
}: ColumnFilterButtonProps) {
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // 候補行から一意な値を取得（カスケード済み）
  const allValues = [...new Set(candidateRows.map((r) => r[columnKey] ?? ''))].sort()

  const displayValues = search.trim()
    ? allValues.filter((v) => v.toLowerCase().includes(search.toLowerCase()))
    : allValues

  // ポップオーバーを開いたとき: アクティブフィルタがあればそれを、なければすべてチェック
  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelected(
        activeFilter && activeFilter.size > 0
          ? new Set(activeFilter)
          : new Set(allValues)   // デフォルト: すべて選択
      )
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const isActive = (activeFilter?.size ?? 0) > 0

  const toggle = (v: string) => {
    const next = new Set(selected)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    setSelected(next)
  }

  return (
    <div className="relative shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        className={`flex items-center rounded px-0.5 py-0.5 transition-colors hover:bg-gray-200 ${
          isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
        }`}
        title="列フィルタ"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M0 2h10L6 7H4L0 2z" />
        </svg>
        {isActive && (
          <span className="ml-0.5 text-blue-600" style={{ fontSize: 8, lineHeight: 1 }}>●</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={onClose} />
          <div
            className="absolute right-0 top-full z-30 mt-1 w-52 rounded-lg border border-gray-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 検索 */}
            <div className="border-b border-gray-100 p-2">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="値を検索..."
                className="w-full rounded border border-gray-200 px-2 py-1 text-xs text-gray-700"
              />
            </div>

            {/* すべて選択 / すべて解除 */}
            <div className="flex gap-1 border-b border-gray-100 px-2 py-1.5">
              <button
                onClick={() => setSelected(new Set(allValues))}
                className="flex-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
              >
                すべて選択
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="flex-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
              >
                すべて解除
              </button>
            </div>

            {/* チェックボックスリスト */}
            <div className="max-h-44 overflow-auto">
              {displayValues.length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-gray-400">該当なし</p>
              )}
              {displayValues.map((v) => (
                <label
                  key={v}
                  className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(v)}
                    onChange={() => toggle(v)}
                    className="accent-blue-600"
                  />
                  <span className="truncate text-xs text-gray-700">{v || '（空）'}</span>
                </label>
              ))}
            </div>

            {/* 適用 / クリア */}
            <div className="flex gap-2 border-t border-gray-100 p-2">
              <button
                onClick={onClear}
                className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                クリア
              </button>
              <button
                onClick={() => onApply(selected)}
                className="flex-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                適用
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
