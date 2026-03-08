import { useState } from 'react'
import type { ProfileDetail, ProfileSummary } from '../lib/domain/settings'

const MOCK_PROFILES: ProfileSummary[] = [
  { id: '1', name: '案件A 1次試験' },
  { id: '2', name: '案件B 総合テスト' },
]

const MOCK_DETAILS: Record<string, ProfileDetail> = {
  '1': {
    id: '1',
    name: '案件A 1次試験',
    archiverPath: 'C:\\Tools\\myarchiver.exe',
    terminals: [
      { id: 't1', ipAddress: '192.168.1.10', displayName: '端末A' },
      { id: 't2', ipAddress: '192.168.1.11', displayName: '端末B' },
    ],
  },
  '2': {
    id: '2',
    name: '案件B 総合テスト',
    archiverPath: 'C:\\Tools\\myarchiver.exe',
    terminals: [
      { id: 't3', ipAddress: '192.168.2.10', displayName: '端末A' },
    ],
  },
}

export default function SettingsPage() {
  const [selectedId, setSelectedId] = useState<string>(MOCK_PROFILES[0]?.id ?? '1')
  const profile = MOCK_DETAILS[selectedId]

  if (!profile) return null

  return (
    <div className="flex h-full">
      {/* プロファイル一覧 */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            プロファイル
          </span>
          <button className="text-lg text-gray-400 hover:text-gray-700" title="追加">+</button>
        </div>
        <ul>
          {MOCK_PROFILES.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setSelectedId(p.id)}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  p.id === selectedId
                    ? 'bg-blue-50 font-medium text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* プロファイル詳細 */}
      <div className="flex-1 overflow-auto p-6">
        <h1 className="mb-6 text-lg font-semibold text-gray-800">{profile.name}</h1>

        {/* 基本設定 */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            基本設定
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <label className="block">
              <span className="text-sm text-gray-600">アーカイバパス</span>
              <input
                type="text"
                defaultValue={profile.archiverPath}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
                readOnly
              />
            </label>
          </div>
        </section>

        {/* 端末マスタ */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              端末マスタ
            </h2>
            <button className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700">
              端末を追加
            </button>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">IPアドレス</th>
                  <th className="px-4 py-3">表示名</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {profile.terminals.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-mono text-gray-700">{t.ipAddress}</td>
                    <td className="px-4 py-3 text-gray-700">{t.displayName ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-xs text-gray-400 hover:text-gray-700">編集</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
