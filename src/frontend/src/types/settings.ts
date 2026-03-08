export type TerminalInfo = {
  id: string
  ipAddress: string
  displayName: string | null
}

export type ProfileSummary = {
  id: string
  name: string
}

export type ProfileDetail = {
  id: string
  name: string
  archiverPath: string
  terminals: TerminalInfo[]
}
