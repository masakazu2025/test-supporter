export type EntryRecord = {
  entryId: string
  filename: string
  capturedAt: string
  inPool: boolean
}

export type ScreenshotRecord = {
  filename: string
  capturedAt: string
  inPool: boolean
}

export type TerminalTab = 'entries' | 'screenshots' | 'logs'

export type CollectDateMode = 'today' | 'fixed'

export type TerminalManagementRecord = {
  id: string
  ipAddress: string
  displayName: string | null
  isOnline: boolean | null  // null = 確認中
  autoCollect: boolean
  collectDateMode: CollectDateMode
  collectDate: string  // 'YYYY-MM-DD'
}

export type PoolStats = {
  fileCount: number
  totalBytes: number
}

export type CleanupMode = 'before' | 'range' | 'all'

export type FileContentType = 'text' | 'table' | 'json'

export type EntryFile = {
  name: string        // 内部ファイル名（API識別用）
  label: string       // 日本語表示名
  type: FileContentType
  sizeBytes?: number
}
