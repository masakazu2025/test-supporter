export type Evidence = {
  id: string
  filename: string
  source: 'pool' | 'direct'
  addedAt: string
}

export type DefectRecord = {
  id: string
  testCaseId: string | null
  testCaseRef: string | null
  title: string
  description: string
}

export type TestCaseSummary = {
  id: string
  specRef: string
  name: string | null
  evidenceCount: number
  defectCount: number
}

export type TestCaseDetail = {
  id: string
  specRef: string
  name: string | null
  evidences: Evidence[]
  defects: DefectRecord[]
}

export type EvaluationTab = 'testcases' | 'defects'
