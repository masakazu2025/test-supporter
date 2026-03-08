import { useState } from 'react'
import type {
  DefectRecord,
  EvaluationTab,
  TestCaseDetail,
  TestCaseSummary,
} from '../types/evaluation'

const MOCK_TESTCASES: TestCaseSummary[] = [
  { id: '1', specRef: '1-001', name: 'ログイン正常系', evidenceCount: 2, defectCount: 0 },
  { id: '2', specRef: '1-002', name: 'ログイン異常系（パスワード誤り）', evidenceCount: 1, defectCount: 1 },
  { id: '3', specRef: '2-001', name: 'データ登録', evidenceCount: 0, defectCount: 0 },
]

const MOCK_DETAILS: Record<string, TestCaseDetail> = {
  '1': {
    id: '1', specRef: '1-001', name: 'ログイン正常系',
    evidences: [
      { id: 'e1', filename: '001.gz', source: 'pool', addedAt: '2024-03-15 09:30:05' },
      { id: 'e2', filename: '192168001010_20240315093005.png', source: 'pool', addedAt: '2024-03-15 09:30:05' },
    ],
    defects: [],
  },
  '2': {
    id: '2', specRef: '1-002', name: 'ログイン異常系（パスワード誤り）',
    evidences: [
      { id: 'e3', filename: '002.gz', source: 'pool', addedAt: '2024-03-15 09:31:12' },
    ],
    defects: [
      { id: 'd1', testCaseId: '2', testCaseRef: '1-002', title: 'エラーメッセージが表示されない', description: 'パスワード誤り時にエラーメッセージが出ない' },
    ],
  },
  '3': {
    id: '3', specRef: '2-001', name: 'データ登録',
    evidences: [],
    defects: [],
  },
}

const MOCK_DEFECTS: DefectRecord[] = [
  { id: 'd1', testCaseId: '2', testCaseRef: '1-002', title: 'エラーメッセージが表示されない', description: 'パスワード誤り時にエラーメッセージが出ない' },
  { id: 'd2', testCaseId: null, testCaseRef: null, title: '画面遷移が遅い', description: 'ログイン後の画面遷移に5秒以上かかる' },
]

const MAIN_TABS: { id: EvaluationTab; label: string }[] = [
  { id: 'testcases', label: 'テストケース' },
  { id: 'defects', label: '不具合' },
]

export default function EvaluationPage() {
  const [activeTab, setActiveTab] = useState<EvaluationTab>('testcases')

  return (
    <div className="flex h-full flex-col">
      {/* メインタブ */}
      <div className="flex border-b border-gray-200 bg-white px-6">
        {MAIN_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-5 py-3 text-sm font-medium transition-colors ${
              id === activeTab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'testcases' && <TestCasesTab />}
        {activeTab === 'defects' && <DefectsTab defects={MOCK_DEFECTS} />}
      </div>
    </div>
  )
}

function TestCasesTab() {
  const [selectedId, setSelectedId] = useState<string>(MOCK_TESTCASES[0]?.id ?? '')
  const detail = selectedId ? MOCK_DETAILS[selectedId] : null

  return (
    <div className="flex h-full">
      {/* テストケース一覧 */}
      <aside className="w-64 shrink-0 overflow-auto border-r border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            テストケース
          </span>
          <button className="text-lg text-gray-400 hover:text-gray-700" title="追加">+</button>
        </div>
        <ul>
          {MOCK_TESTCASES.map((tc) => (
            <li key={tc.id}>
              <button
                onClick={() => setSelectedId(tc.id)}
                className={`w-full px-4 py-2.5 text-left transition-colors ${
                  tc.id === selectedId
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`text-sm font-medium ${tc.id === selectedId ? 'text-blue-700' : 'text-gray-800'}`}>
                  <span className="font-mono text-xs text-gray-400">{tc.specRef}</span>
                  {' '}
                  {tc.name ?? '—'}
                </div>
                <div className="mt-0.5 flex gap-2 text-xs text-gray-400">
                  <span>エビデンス {tc.evidenceCount}</span>
                  {tc.defectCount > 0 && (
                    <span className="text-red-500">不具合 {tc.defectCount}</span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* テストケース詳細 */}
      <div className="flex-1 overflow-auto p-6">
        {detail ? (
          <TestCaseDetailPanel detail={detail} />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            テストケースを選択してください
          </div>
        )}
      </div>
    </div>
  )
}

type TestCaseDetailPanelProps = { detail: TestCaseDetail }

function TestCaseDetailPanel({ detail }: TestCaseDetailPanelProps) {
  return (
    <div>
      <div className="mb-6">
        <span className="font-mono text-sm text-gray-400">{detail.specRef}</span>
        <h2 className="mt-1 text-lg font-semibold text-gray-800">{detail.name ?? '—'}</h2>
      </div>

      {/* エビデンス */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            エビデンス
          </h3>
          <button className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700">
            追加
          </button>
        </div>
        {detail.evidences.length === 0 ? (
          <p className="text-sm text-gray-400">エビデンスなし</p>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">ファイル名</th>
                  <th className="px-4 py-3">ソース</th>
                  <th className="px-4 py-3">追加日時</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {detail.evidences.map((ev) => (
                  <tr key={ev.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-mono text-gray-700">{ev.filename}</td>
                    <td className="px-4 py-3 text-gray-500">{ev.source}</td>
                    <td className="px-4 py-3 text-gray-500">{ev.addedAt}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-xs text-blue-600 hover:underline">閲覧</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 不具合 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            不具合
          </h3>
          <button className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
            起票
          </button>
        </div>
        {detail.defects.length === 0 ? (
          <p className="text-sm text-gray-400">不具合なし</p>
        ) : (
          <div className="space-y-2">
            {detail.defects.map((d) => (
              <div key={d.id} className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                <div className="text-sm font-medium text-red-800">{d.title}</div>
                <div className="mt-0.5 text-xs text-red-600">{d.description}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

type DefectsTabProps = { defects: DefectRecord[] }

function DefectsTab({ defects }: DefectsTabProps) {
  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">全不具合一覧</h2>
        <button className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
          単独起票
        </button>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">タイトル</th>
              <th className="px-4 py-3">テストケース</th>
              <th className="px-4 py-3">内容</th>
            </tr>
          </thead>
          <tbody>
            {defects.map((d) => (
              <tr key={d.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-800">{d.title}</td>
                <td className="px-4 py-3">
                  {d.testCaseRef ? (
                    <span className="font-mono text-xs text-gray-500">{d.testCaseRef}</span>
                  ) : (
                    <span className="text-xs text-gray-400">単独</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{d.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
