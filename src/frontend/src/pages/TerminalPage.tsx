import { useState } from "react";
import type {
  EntryRecord,
  EntryFile,
  ScreenshotRecord,
  TerminalTab,
  CollectDateMode,
  CleanupMode,
  TerminalManagementRecord,
} from "../lib/domain/terminal";
import type { TerminalInfo } from "../lib/domain/settings";
import { TextViewer } from "../components/viewers/TextViewer";
import { TableViewer } from "../components/viewers/TableViewer";
import { JsonViewer } from "../components/viewers/JsonViewer";
import type { TextViewerConfig } from "../components/viewers/TextViewer";
import type { TableViewerConfig } from "../components/viewers/TableViewer";
import type { JsonViewerConfig } from "../components/viewers/JsonViewer";

// ---- モックデータ ----

const MOCK_TERMINALS: TerminalInfo[] = [
  { id: "t1", ipAddress: "192.168.1.10", displayName: "SERVER-01" },
  { id: "t2", ipAddress: "192.168.1.11", displayName: "SERVER-02" },
  { id: "t3", ipAddress: "192.168.1.12", displayName: "SERVER-03" },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

const INITIAL_MGMT: TerminalManagementRecord[] = [
  {
    id: "t1",
    ipAddress: "192.168.1.10",
    displayName: "SERVER-01",
    isOnline: true,
    autoCollect: true,
    collectDateMode: "today",
    collectDate: todayStr(),
  },
  {
    id: "t2",
    ipAddress: "192.168.1.11",
    displayName: "SERVER-02",
    isOnline: false,
    autoCollect: false,
    collectDateMode: "fixed",
    collectDate: "2026-03-06",
  },
  {
    id: "t3",
    ipAddress: "192.168.1.12",
    displayName: "SERVER-03",
    isOnline: null,
    autoCollect: true,
    collectDateMode: "today",
    collectDate: todayStr(),
  },
];

const MOCK_ENTRIES: EntryRecord[] = [
  {
    entryId: "001",
    filename: "001.gz",
    capturedAt: "2024-03-15 09:30:05",
    inPool: true,
  },
  {
    entryId: "002",
    filename: "002.gz",
    capturedAt: "2024-03-15 09:31:12",
    inPool: true,
  },
  {
    entryId: "003",
    filename: "003.gz",
    capturedAt: "2024-03-15 09:32:44",
    inPool: false,
  },
  {
    entryId: "004",
    filename: "004.gz",
    capturedAt: "2024-03-15 09:33:58",
    inPool: false,
  },
  {
    entryId: "005",
    filename: "005.gz",
    capturedAt: "2024-03-15 09:35:01",
    inPool: false,
  },
];

// ---- ビューア設定（実際はAPIスキーマ or 設定ファイルから取得） ----

const TEXT_CONFIG: TextViewerConfig = {
  fontFamily: "mono",
  fontSize: "xs",
  lineHeight: "relaxed",
};

const RECEIPT_CONFIG: TextViewerConfig = {
  fontFamily: "ms-gothic",
  fontSize: "sm",
  lineHeight: "normal",
  wordWrap: false,
  width: "300px",
};

const TABLE_CONFIG_SUMMARY: TableViewerConfig = {
  fontSize: "sm",
  columns: [
    { key: "no", label: "No", width: "3rem", align: "right" },
    { key: "txnId", label: "取引ID", width: "8rem" },
    { key: "type", label: "種別", width: "5rem" },
    { key: "amount", label: "金額", width: "7rem", align: "right" },
    {
      key: "result",
      label: "結果",
      width: "4rem",
      align: "center",
      render: (v) =>
        v === "OK" ? (
          <span className="font-medium text-green-700">OK</span>
        ) : v === "NG" ? (
          <span className="font-medium text-red-600">NG</span>
        ) : (
          <span className="text-gray-400">{v}</span>
        ),
    },
    { key: "time", label: "処理時刻" },
  ],
};

const TABLE_CONFIG_DETAIL: TableViewerConfig = {
  fontSize: "sm",
  columns: [
    { key: "no", label: "No", width: "3rem", align: "right" },
    { key: "item", label: "項目" },
    { key: "before", label: "変更前", align: "right" },
    { key: "after", label: "変更後", align: "right" },
  ],
};

const JSON_CONFIG: JsonViewerConfig = { fontSize: "xs", indent: 2 };

// ---- モックコンテンツ ----

const MOCK_RECEIPT_CONTENT = `　　　　ファミリーマート
　　　　渋谷道玄坂一丁目店
　〒150-0043
  東京都渋谷区道玄坂1-2-3
　　　　TEL: 03-1234-5678

　2024年03月15日(金) 09:30:15
　レジ:03　　　　　　　担当:山田

--------------------------------
おにぎり 鮭               ¥130
お茶 2L ×2              ¥258
ファミチキ                 ¥250
おにぎり 鮭               ¥130
お茶 2L ×2              ¥258
ファミチキ                 ¥250
おにぎり 鮭               ¥130
お茶 2L ×2              ¥258
ファミチキ                 ¥250
おにぎり 鮭               ¥130
お茶 2L ×2              ¥258
ファミチキ                 ¥250
おにぎり 鮭               ¥130
お茶 2L ×2              ¥258
ファミチキ                 ¥250
おにぎり 鮭               ¥130
お茶 2L ×2              ¥258
ファミチキ                 ¥250
おにぎり 鮭               ¥130
お茶 2L ×2              ¥258
ファミチキ                 ¥250
--------------------------------
　　　　　小計            ¥638
　(内消費税 8%対象         ¥388)
　(内消費税10%対象         ¥250)
　消費税( 8%)              ¥28
　消費税(10%)              ¥22
================================
　　　　　合計            ¥710
　　　　お預かり        ¥1,000
　　　　　お釣り          ¥290
================================
　Famiポイント             0pt
　レシートNo: 1234-5678
--------------------------------
ありがとうございました
またのご来店をお待ちしております
`;

const MOCK_TEXT_CONTENT = `2024-03-15 09:30:05 [INFO]  セッション開始 session_id=A1B2C3
2024-03-15 09:30:06 [INFO]  認証成功 user=operator01
2024-03-15 09:30:08 [INFO]  トランザクション受付 txn_id=TX-00123 amount=15800
2024-03-15 09:30:09 [INFO]  残高照会 balance=234500
2024-03-15 09:30:11 [INFO]  振替処理開始
2024-03-15 09:30:12 [INFO]  振替完了 txn_id=TX-00123 result=OK
2024-03-15 09:30:13 [INFO]  セッション終了`;

const MOCK_TABLE_ROWS_SUMMARY = [
  {
    no: "1",
    txnId: "TX-00121",
    type: "振替",
    amount: "12,000",
    result: "OK",
    time: "09:28:44",
  },
  {
    no: "2",
    txnId: "TX-00122",
    type: "照会",
    amount: "-",
    result: "OK",
    time: "09:29:31",
  },
  {
    no: "3",
    txnId: "TX-00123",
    type: "振替",
    amount: "15,800",
    result: "OK",
    time: "09:30:12",
  },
  {
    no: "4",
    txnId: "TX-00124",
    type: "振替",
    amount: "3,200",
    result: "NG",
    time: "09:31:05",
  },
  {
    no: "5",
    txnId: "TX-00125",
    type: "照会",
    amount: "-",
    result: "OK",
    time: "09:32:19",
  },
];

const MOCK_TABLE_ROWS_DETAIL = [
  { no: "1", item: "口座残高", before: "234,500", after: "218,700" },
  { no: "2", item: "振替手数料", before: "0", after: "220" },
  { no: "3", item: "最終更新日時", before: "2024-03-14", after: "2024-03-15" },
];

const MOCK_JSON_DATA = {
  session_id: "A1B2C3",
  terminal_id: "TM-001",
  operator: "operator01",
  started_at: "2024-03-15T09:30:05",
  ended_at: "2024-03-15T09:30:13",
  transactions: [
    { id: "TX-00123", type: "transfer", amount: 15800, result: "OK" },
    { id: "TX-00124", type: "transfer", amount: 3200, result: "NG" },
  ],
  summary: { total: 2, ok: 1, ng: 1 },
};

// ---- エントリファイル定義 ----

const MOCK_ENTRY_FILES: Record<string, EntryFile[]> = {
  "001": [
    {
      name: "transaction.txt",
      label: "取引ログ",
      type: "text",
      sizeBytes: 1024,
    },
    {
      name: "summary.csv",
      label: "取引集計表",
      type: "table",
      sizeBytes: 4096,
    },
    {
      name: "session.json",
      label: "セッション情報",
      type: "json",
      sizeBytes: 512,
    },
  ],
  "002": [
    { name: "receipt.txt", label: "レシート", type: "text", sizeBytes: 768 },
    { name: "detail.csv", label: "取引明細", type: "table", sizeBytes: 2048 },
  ],
};

const MOCK_SCREENSHOTS: ScreenshotRecord[] = [
  {
    filename: "192168001010_20240315093005.png",
    capturedAt: "2024-03-15 09:30:05",
    inPool: true,
  },
  {
    filename: "192168001010_20240315093112.png",
    capturedAt: "2024-03-15 09:31:12",
    inPool: true,
  },
  {
    filename: "192168001010_20240315093244.png",
    capturedAt: "2024-03-15 09:32:44",
    inPool: false,
  },
  {
    filename: "192168001010_20240315093315.png",
    capturedAt: "2024-03-15 09:33:15",
    inPool: false,
  },
  {
    filename: "192168001010_20240315093401.png",
    capturedAt: "2024-03-15 09:34:01",
    inPool: false,
  },
];

// ---- 型定義 ----

type CleanupTarget = {
  id: string;
  displayName: string | null;
  ipAddress: string;
};

// ================================================================
// メインページ
// ================================================================

export default function TerminalPage() {
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>(
    MOCK_TERMINALS[0]?.id ?? "",
  );
  const [mgmtRows, setMgmtRows] =
    useState<TerminalManagementRecord[]>(INITIAL_MGMT);
  const [mgmtTarget, setMgmtTarget] = useState<string | null>(null);
  const [showAllMgmt, setShowAllMgmt] = useState(false);
  const [cleanupTarget, setCleanupTarget] = useState<CleanupTarget | null>(
    null,
  );

  const toggleAutoCollect = (id: string) =>
    setMgmtRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, autoCollect: !r.autoCollect } : r,
      ),
    );

  const setDateMode = (id: string, mode: CollectDateMode) =>
    setMgmtRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              collectDateMode: mode,
              collectDate: mode === "today" ? todayStr() : r.collectDate,
            }
          : r,
      ),
    );

  const setDate = (id: string, date: string) =>
    setMgmtRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, collectDate: date } : r)),
    );

  const openCleanup = (id: string) => {
    const t = MOCK_TERMINALS.find((t) => t.id === id);
    if (t)
      setCleanupTarget({
        id,
        displayName: t.displayName,
        ipAddress: t.ipAddress,
      });
  };

  const selectedTerminal =
    MOCK_TERMINALS.find((t) => t.id === selectedTerminalId) ?? null;

  return (
    <div className="flex h-full">
      {/* 左ペイン: 端末リスト */}
      <TerminalSidebar
        terminals={MOCK_TERMINALS}
        mgmtRows={mgmtRows}
        selectedId={selectedTerminalId}
        onSelect={setSelectedTerminalId}
        onManage={(id) => setMgmtTarget(id)}
        onAllManage={() => setShowAllMgmt(true)}
      />

      {/* コンテンツ */}
      <div className="flex-1 overflow-hidden">
        <ViewingContent
          selectedTerminalId={selectedTerminalId}
          selectedTerminal={selectedTerminal}
        />
      </div>

      {/* 端末ごと管理モーダル */}
      {mgmtTarget &&
        (() => {
          const row = mgmtRows.find((r) => r.id === mgmtTarget);
          const terminal = MOCK_TERMINALS.find((t) => t.id === mgmtTarget);
          if (!row || !terminal) return null;
          return (
            <TerminalManagementModal
              terminal={terminal}
              row={row}
              onToggleAutoCollect={() => toggleAutoCollect(mgmtTarget)}
              onSetDateMode={(mode) => setDateMode(mgmtTarget, mode)}
              onSetDate={(date) => setDate(mgmtTarget, date)}
              onCleanup={() => openCleanup(mgmtTarget)}
              onClose={() => setMgmtTarget(null)}
            />
          );
        })()}

      {/* 管理一覧モーダル */}
      {showAllMgmt && (
        <AllMgmtModal
          rows={mgmtRows}
          terminals={MOCK_TERMINALS}
          onToggleAutoCollect={toggleAutoCollect}
          onSetDateMode={setDateMode}
          onSetDate={setDate}
          onCleanup={openCleanup}
          onClose={() => setShowAllMgmt(false)}
        />
      )}

      {/* プール削除モーダル */}
      {cleanupTarget && (
        <CleanupModal
          target={cleanupTarget}
          onClose={() => setCleanupTarget(null)}
        />
      )}
    </div>
  );
}

// ================================================================
// 左ペイン: 端末リスト
// ================================================================

type TerminalSidebarProps = {
  terminals: TerminalInfo[];
  mgmtRows: TerminalManagementRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
  onManage: (id: string) => void;
  onAllManage: () => void;
};

function TerminalSidebar({
  terminals,
  mgmtRows,
  selectedId,
  onSelect,
  onManage,
  onAllManage,
}: TerminalSidebarProps) {
  return (
    <aside className="flex w-44 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex-1 overflow-auto py-1">
        {terminals.map((t) => {
          const row = mgmtRows.find((r) => r.id === t.id);
          const selected = t.id === selectedId;
          return (
            <div
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`group flex cursor-pointer items-center gap-2 px-3 py-2.5 transition-colors ${
                selected ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <OnlineDot isOnline={row?.isOnline ?? null} />
              <div className="min-w-0 flex-1">
                <div
                  className={`truncate text-sm font-medium ${selected ? "text-blue-700" : "text-gray-700"}`}
                >
                  {t.displayName ?? t.ipAddress}
                </div>
                <div className="truncate font-mono text-xs text-gray-400">
                  {t.ipAddress}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onManage(t.id);
                }}
                className="shrink-0 rounded p-0.5 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
                title="端末管理"
              >
                ⚙
              </button>
            </div>
          );
        })}
      </div>
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={onAllManage}
          className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
        >
          管理一覧
        </button>
      </div>
    </aside>
  );
}

function OnlineDot({ isOnline }: { isOnline: boolean | null }) {
  if (isOnline === null)
    return (
      <span className="h-2 w-2 shrink-0 rounded-full bg-yellow-400 animate-pulse" />
    );
  return isOnline ? (
    <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
  ) : (
    <span className="h-2 w-2 shrink-0 rounded-full bg-red-400" />
  );
}

// ================================================================
// 閲覧コンテンツ（サブタブ + 検索）
// ================================================================

type ViewingContentProps = {
  selectedTerminalId: string;
  selectedTerminal: TerminalInfo | null;
};

function ViewingContent({
  selectedTerminalId,
  selectedTerminal,
}: ViewingContentProps) {
  const [subTab, setSubTab] = useState<TerminalTab>("entries");
  const [selectedEntry, setSelectedEntry] = useState<EntryRecord | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] =
    useState<ScreenshotRecord | null>(null);
  const [showDetailSearch, setShowDetailSearch] = useState(false);
  const [searchDate, setSearchDate] = useState("");
  const [searchEntryNo, setSearchEntryNo] = useState("");

  const isDetailView = selectedEntry !== null || selectedScreenshot !== null;

  const clearDetail = () => {
    setSelectedEntry(null);
    setSelectedScreenshot(null);
  };

  const handleSubTabChange = (tab: TerminalTab) => {
    setSubTab(tab);
    clearDetail();
  };

  const SUB_TABS: { id: TerminalTab; label: string }[] = [
    { id: "entries", label: "エントリ" },
    { id: "screenshots", label: "画像" },
    { id: "logs", label: "ログ" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダーバー: サブタブ（左）| 検索（右） */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex">
          {SUB_TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleSubTabChange(id)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                id === subTab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {!isDetailView && subTab !== "logs" && (
          <div className="flex items-center gap-2 py-2">
            <div className="mx-1 h-5 w-px bg-gray-200" />
            {subTab === "entries" && (
              <>
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700"
                />
                <input
                  type="text"
                  placeholder="No"
                  value={searchEntryNo}
                  onChange={(e) => setSearchEntryNo(e.target.value)}
                  className="w-20 rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </>
            )}
            {subTab === "screenshots" && (
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700"
              />
            )}
            <button
              onClick={() => setShowDetailSearch(true)}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              詳細▼
            </button>
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-auto p-6">
        {!isDetailView && (
          <>
            {subTab === "entries" && (
              <EntriesView entries={MOCK_ENTRIES} onSelect={setSelectedEntry} />
            )}
            {subTab === "screenshots" && (
              <ScreenshotsView
                screenshots={MOCK_SCREENSHOTS}
                onSelect={setSelectedScreenshot}
              />
            )}
            {subTab === "logs" && <LogsView />}
          </>
        )}
        {selectedEntry && (
          <EntryDetailView
            entry={selectedEntry}
            terminal={selectedTerminal}
            onClose={clearDetail}
          />
        )}
        {selectedScreenshot && (
          <ScreenshotDetailView
            screenshot={selectedScreenshot}
            screenshots={MOCK_SCREENSHOTS}
            onClose={clearDetail}
            onNavigate={setSelectedScreenshot}
          />
        )}
      </div>

      {showDetailSearch && (
        <DetailSearchModal
          subTab={subTab}
          onClose={() => setShowDetailSearch(false)}
        />
      )}
    </div>
  );
}

// ================================================================
// エントリ一覧 / 詳細
// ================================================================

function EntriesView({
  entries,
  onSelect,
}: {
  entries: EntryRecord[];
  onSelect: (e: EntryRecord) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">エントリNo</th>
            <th className="px-4 py-3">ファイル名</th>
            <th className="px-4 py-3">採取日時</th>
            <th className="px-4 py-3">状態</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr
              key={e.entryId}
              onClick={e.inPool ? () => onSelect(e) : undefined}
              className={`border-b border-gray-100 last:border-0 ${
                e.inPool
                  ? "cursor-pointer hover:bg-gray-50"
                  : "cursor-default opacity-50"
              }`}
            >
              <td className="px-4 py-3 font-mono font-medium text-gray-800">
                {e.entryId}
              </td>
              <td className="px-4 py-3 font-mono text-gray-600">
                {e.filename}
              </td>
              <td className="px-4 py-3 text-gray-600">{e.capturedAt}</td>
              <td className="px-4 py-3">
                {e.inPool ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    採取済
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    未採取
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EntryDetailView({
  entry,
  terminal,
  onClose,
}: {
  entry: EntryRecord;
  terminal: TerminalInfo | null;
  onClose: () => void;
}) {
  const files = MOCK_ENTRY_FILES[entry.entryId] ?? [];
  const [selectedFile, setSelectedFile] = useState<EntryFile | null>(
    files[0] ?? null,
  );
  const [showSave, setShowSave] = useState(false);

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            エントリ {entry.entryId}
          </h2>
          <p className="text-sm text-gray-500">
            {terminal?.displayName ?? terminal?.ipAddress ?? ""}
            {terminal && (
              <span className="ml-2 font-mono text-xs text-gray-400">
                {terminal.ipAddress}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSave(true)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            保存...
          </button>
          <button
            onClick={onClose}
            className="text-xl leading-none text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>

      {/* メタ情報 */}
      <div className="mb-3 grid grid-cols-4 gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
        <div>
          <div className="text-xs text-gray-500">エントリNo</div>
          <div className="font-mono font-medium text-gray-800">
            {entry.entryId}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">採取日時</div>
          <div className="text-gray-700">{entry.capturedAt}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">アーカイブ</div>
          <div className="font-mono text-gray-700">{entry.filename}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">状態</div>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            採取済（プール）
          </span>
        </div>
      </div>

      {/* ファイルリスト（左） + ビューア（右） */}
      <div className="flex min-h-0 flex-1 gap-3">
        {/* 左: ファイル一覧 */}
        <div className="flex w-44 shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500">
            ファイル ({files.length})
          </div>
          <div className="flex-1 overflow-auto py-1">
            {files.length === 0 && (
              <p className="px-3 py-4 text-xs text-gray-400">ファイルなし</p>
            )}
            {files.map((f) => {
              const selected = selectedFile?.name === f.name;
              return (
                <button
                  key={f.name}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full px-3 py-2 text-left transition-colors ${
                    selected ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`truncate text-sm ${selected ? "text-blue-700 font-medium" : "text-gray-700"}`}
                  >
                    {f.label}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <FileTypeBadge type={f.type} />
                    {f.sizeBytes !== undefined && (
                      <span className="text-xs text-gray-400">
                        {formatBytes(f.sizeBytes)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 右: ビューア */}
        <div className="flex-1 overflow-hidden">
          {selectedFile ? (
            <EntryFileViewer file={selectedFile} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
              ファイルを選択してください
            </div>
          )}
        </div>
      </div>

      {showSave && (
        <SaveModal
          filename={selectedFile?.name ?? entry.filename}
          onClose={() => setShowSave(false)}
        />
      )}
    </div>
  );
}

// ファイル種別に応じてビューアを切り替え
function EntryFileViewer({ file }: { file: EntryFile }) {
  if (file.type === "text") {
    const isReceipt = file.name.includes("receipt");
    return (
      <TextViewer
        label={file.label}
        filename={file.name}
        content={isReceipt ? MOCK_RECEIPT_CONTENT : MOCK_TEXT_CONTENT}
        config={isReceipt ? RECEIPT_CONFIG : TEXT_CONFIG}
      />
    );
  }
  if (file.type === "table") {
    const rows = file.name.includes("summary")
      ? MOCK_TABLE_ROWS_SUMMARY
      : MOCK_TABLE_ROWS_DETAIL;
    const config = file.name.includes("summary")
      ? TABLE_CONFIG_SUMMARY
      : TABLE_CONFIG_DETAIL;
    return (
      <TableViewer
        label={file.label}
        filename={file.name}
        rows={rows}
        config={config}
      />
    );
  }
  return (
    <JsonViewer
      label={file.label}
      filename={file.name}
      data={MOCK_JSON_DATA}
      config={JSON_CONFIG}
    />
  );
}

type FileTypeBadgeProps = { type: EntryFile["type"] };
function FileTypeBadge({ type }: FileTypeBadgeProps) {
  const styles: Record<EntryFile["type"], string> = {
    text: "bg-gray-100 text-gray-600",
    table: "bg-blue-100 text-blue-700",
    json: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`rounded px-1 py-0.5 font-mono text-xs font-medium ${styles[type]}`}
    >
      {type.toUpperCase()}
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

// ================================================================
// 画像一覧 / 詳細
// ================================================================

function ScreenshotsView({
  screenshots,
  onSelect,
}: {
  screenshots: ScreenshotRecord[];
  onSelect: (s: ScreenshotRecord) => void;
}) {
  const [viewMode, setViewMode] = useState<"tile" | "list">("tile");

  return (
    <div>
      <div className="mb-4 flex justify-end gap-1">
        {(["tile", "list"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === m ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
          >
            {m === "tile" ? "▤ タイル" : "☰ 一覧"}
          </button>
        ))}
      </div>

      {viewMode === "tile" ? (
        <div className="grid grid-cols-4 gap-4">
          {screenshots.map((s) => (
            <div
              key={s.filename}
              onClick={s.inPool ? () => onSelect(s) : undefined}
              className={`overflow-hidden rounded-lg border border-gray-200 bg-white text-left transition-all ${
                s.inPool
                  ? "cursor-pointer hover:border-blue-300 hover:shadow-sm"
                  : "cursor-default opacity-50"
              }`}
            >
              <div className="flex h-32 items-center justify-center bg-gray-100 text-xs text-gray-400">
                画像プレビュー
              </div>
              <div className="p-2">
                <div className="truncate font-mono text-xs text-gray-600">
                  {s.filename}
                </div>
                <div className="mt-0.5 text-xs text-gray-400">
                  {s.capturedAt}
                </div>
                <div className="mt-1">
                  {s.inPool ? (
                    <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                      採取済
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                      未採取
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">ファイル名</th>
                <th className="px-4 py-3">日時</th>
                <th className="px-4 py-3">状態</th>
              </tr>
            </thead>
            <tbody>
              {screenshots.map((s) => (
                <tr
                  key={s.filename}
                  onClick={s.inPool ? () => onSelect(s) : undefined}
                  className={`border-b border-gray-100 last:border-0 ${
                    s.inPool
                      ? "cursor-pointer hover:bg-gray-50"
                      : "cursor-default opacity-50"
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-gray-700">
                    {s.filename}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.capturedAt}</td>
                  <td className="px-4 py-3">
                    {s.inPool ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        採取済
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        未採取
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ScreenshotDetailView({
  screenshot,
  screenshots,
  onClose,
  onNavigate,
}: {
  screenshot: ScreenshotRecord;
  screenshots: ScreenshotRecord[];
  onClose: () => void;
  onNavigate: (s: ScreenshotRecord) => void;
}) {
  const [showSave, setShowSave] = useState(false);
  const pooled = screenshots.filter((s) => s.inPool);
  const idx = pooled.findIndex((s) => s.filename === screenshot.filename);

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="font-mono text-sm font-medium text-gray-800">
            {screenshot.filename}
          </p>
          <p className="text-xs text-gray-500">{screenshot.capturedAt}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSave(true)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            保存...
          </button>
          <button
            onClick={onClose}
            className="text-xl leading-none text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>

      {/* プレビュー */}
      <div className="flex flex-1 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
        画像プレビュー
      </div>

      {/* ページネーション */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          採取済（プール）
        </span>
        <div className="flex items-center gap-3">
          <button
            disabled={idx <= 0}
            onClick={() => {
              const prev = pooled[idx - 1];
              if (prev) onNavigate(prev);
            }}
            className="text-blue-600 hover:underline disabled:text-gray-300"
          >
            前へ
          </button>
          <span className="text-xs text-gray-400">
            {idx + 1} / {pooled.length}
          </span>
          <button
            disabled={idx >= pooled.length - 1}
            onClick={() => {
              const next = pooled[idx + 1];
              if (next) onNavigate(next);
            }}
            className="text-blue-600 hover:underline disabled:text-gray-300"
          >
            次へ
          </button>
        </div>
      </div>

      {showSave && (
        <SaveModal
          filename={screenshot.filename}
          onClose={() => setShowSave(false)}
        />
      )}
    </div>
  );
}

function LogsView() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-gray-400">
      ログ閲覧は将来対応予定
    </div>
  );
}

// ================================================================
// 詳細検索モーダル
// ================================================================

function DetailSearchModal({
  subTab,
  onClose,
}: {
  subTab: TerminalTab;
  onClose: () => void;
}) {
  const [entryFrom, setEntryFrom] = useState("");
  const [entryTo, setEntryTo] = useState("");
  const [datetimeFrom, setDatetimeFrom] = useState("");
  const [datetimeTo, setDatetimeTo] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <span className="font-semibold text-gray-800">詳細検索</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-5 space-y-4">
          {subTab === "entries" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                エントリNo
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="001"
                  value={entryFrom}
                  onChange={(e) => setEntryFrom(e.target.value)}
                  className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
                <span className="text-gray-400">〜</span>
                <input
                  type="text"
                  placeholder="999"
                  value={entryTo}
                  onChange={(e) => setEntryTo(e.target.value)}
                  className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              日付時刻
            </label>
            <div className="flex flex-col gap-1.5">
              <input
                type="datetime-local"
                value={datetimeFrom}
                onChange={(e) => setDatetimeFrom(e.target.value)}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700"
              />
              <span className="text-center text-xs text-gray-400">〜</span>
              <input
                type="datetime-local"
                value={datetimeTo}
                onChange={(e) => setDatetimeTo(e.target.value)}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700"
              />
            </div>
          </div>
          {subTab === "screenshots" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                エントリNo（将来対応）
              </label>
              <input
                type="text"
                disabled
                placeholder="001"
                className="w-24 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-400"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
          <button
            onClick={() => {
              setEntryFrom("");
              setEntryTo("");
              setDatetimeFrom("");
              setDatetimeTo("");
            }}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            クリア
          </button>
          <button
            onClick={onClose}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            検索
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// 端末ごと管理モーダル（⚙ から起動）
// ================================================================

type TerminalManagementModalProps = {
  terminal: TerminalInfo;
  row: TerminalManagementRecord;
  onToggleAutoCollect: () => void;
  onSetDateMode: (mode: CollectDateMode) => void;
  onSetDate: (date: string) => void;
  onCleanup: () => void;
  onClose: () => void;
};

function TerminalManagementModal({
  terminal,
  row,
  onToggleAutoCollect,
  onSetDateMode,
  onSetDate,
  onCleanup,
  onClose,
}: TerminalManagementModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <div className="font-semibold text-gray-800">
              {terminal.displayName ?? terminal.ipAddress}
            </div>
            <div className="font-mono text-xs text-gray-400">
              {terminal.ipAddress}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 状態 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">状態</span>
            <span className="flex items-center gap-1.5 text-sm">
              <OnlineDot isOnline={row.isOnline} />
              {row.isOnline === null
                ? "確認中"
                : row.isOnline
                  ? "オンライン"
                  : "オフライン"}
            </span>
          </div>

          {/* 自動採取 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">自動採取</span>
            <Toggle checked={row.autoCollect} onChange={onToggleAutoCollect} />
          </div>

          {/* 採取対象日付 */}
          <div>
            <div className="mb-2 text-sm text-gray-600">採取対象日付</div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  checked={row.collectDateMode === "today"}
                  onChange={() => onSetDateMode("today")}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-600">本日</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  checked={row.collectDateMode === "fixed"}
                  onChange={() => onSetDateMode("fixed")}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-600">指定日</span>
              </label>
              <div className="w-28">
                {row.collectDateMode === "today" ? (
                  <span className="text-xs text-gray-400">
                    {row.collectDate}
                  </span>
                ) : (
                  <input
                    type="date"
                    value={row.collectDate}
                    onChange={(e) => onSetDate(e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-700"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
          <button
            onClick={() => {
              onCleanup();
              onClose();
            }}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors"
          >
            プール削除...
          </button>
          <button
            onClick={onClose}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// 管理一覧モーダル（全端末テーブル）
// ================================================================

type AllMgmtModalProps = {
  rows: TerminalManagementRecord[];
  terminals: TerminalInfo[];
  onToggleAutoCollect: (id: string) => void;
  onSetDateMode: (id: string, mode: CollectDateMode) => void;
  onSetDate: (id: string, date: string) => void;
  onCleanup: (id: string) => void;
  onClose: () => void;
};

function AllMgmtModal({
  rows,
  terminals,
  onToggleAutoCollect,
  onSetDateMode,
  onSetDate,
  onCleanup,
  onClose,
}: AllMgmtModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <span className="font-semibold text-gray-800">端末管理一覧</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="overflow-auto p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="pb-2">端末名 / IP</th>
                <th className="pb-2">採取対象日付</th>
                <th className="pb-2">状態</th>
                <th className="pb-2">自動採取</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const t = terminals.find((t) => t.id === r.id);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3 pr-4">
                      <div className="font-medium text-gray-800">
                        {r.displayName ?? r.ipAddress}
                      </div>
                      <div className="font-mono text-xs text-gray-400">
                        {r.ipAddress}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`am-date-${r.id}`}
                            checked={r.collectDateMode === "today"}
                            onChange={() => onSetDateMode(r.id, "today")}
                            className="accent-blue-600"
                          />
                          <span className="text-xs text-gray-600">本日</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`am-date-${r.id}`}
                            checked={r.collectDateMode === "fixed"}
                            onChange={() => onSetDateMode(r.id, "fixed")}
                            className="accent-blue-600"
                          />
                          <span className="text-xs text-gray-600">指定日</span>
                        </label>
                        <div className="w-24">
                          {r.collectDateMode === "today" ? (
                            <span className="text-xs text-gray-400">
                              {r.collectDate}
                            </span>
                          ) : (
                            <input
                              type="date"
                              value={r.collectDate}
                              onChange={(e) => onSetDate(r.id, e.target.value)}
                              className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs text-gray-700"
                            />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-1.5 text-xs">
                        <OnlineDot isOnline={r.isOnline} />
                        {r.isOnline === null
                          ? "確認中"
                          : r.isOnline
                            ? "オンライン"
                            : "オフライン"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <Toggle
                        checked={r.autoCollect}
                        onChange={() => onToggleAutoCollect(r.id)}
                      />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          onCleanup(r.id);
                          onClose();
                        }}
                        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-gray-200 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// プール削除モーダル
// ================================================================

function CleanupModal({
  target,
  onClose,
}: {
  target: CleanupTarget;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<CleanupMode>("before");
  const [dateBefore, setDateBefore] = useState(todayStr());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState(todayStr());

  const mockCounts = { before: 8, range: 5, all: 12 };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <div className="font-semibold text-gray-800">
              {target.displayName ?? target.ipAddress} プールのクリーンアップ
            </div>
            <div className="font-mono text-xs text-gray-400">
              {target.ipAddress}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            削除する期間を指定してください
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="cleanup-mode"
              checked={mode === "before"}
              onChange={() => setMode("before")}
              className="mt-0.5 accent-blue-600"
            />
            <div>
              <div className="text-sm font-medium text-gray-700">
                指定日より前
              </div>
              {mode === "before" && (
                <input
                  type="date"
                  value={dateBefore}
                  onChange={(e) => setDateBefore(e.target.value)}
                  className="mt-1 rounded border border-gray-300 px-2 py-1 text-sm"
                />
              )}
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="cleanup-mode"
              checked={mode === "range"}
              onChange={() => setMode("range")}
              className="mt-0.5 accent-blue-600"
            />
            <div>
              <div className="text-sm font-medium text-gray-700">
                期間を指定
              </div>
              {mode === "range" && (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  <span className="text-gray-400">〜</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
              )}
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="cleanup-mode"
              checked={mode === "all"}
              onChange={() => setMode("all")}
              className="accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">すべて</span>
          </label>
          <div className="rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-600">
            対象: 約{" "}
            <span className="font-semibold text-gray-800">
              {mockCounts[mode]} 件
            </span>
            （選択中）
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={onClose}
            className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// 保存モーダル
// ================================================================

type SaveDestination = "evaluation" | "defect" | "custom";

function SaveModal({
  filename,
  onClose,
}: {
  filename: string;
  onClose: () => void;
}) {
  const [dest, setDest] = useState<SaveDestination>("evaluation");
  const [customDir, setCustomDir] = useState("");
  const [saveName, setSaveName] = useState(filename);

  const canSave = dest !== "custom" || customDir.trim() !== "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <span className="font-semibold text-gray-800">保存先を選択</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3 p-5">
          {/* 保存先選択 */}
          <div className="space-y-2">
            {(
              [
                {
                  value: "evaluation",
                  label: "評価フォルダ",
                  sub: "テスト仕様書に紐づけて保存",
                },
                {
                  value: "defect",
                  label: "不具合フォルダ",
                  sub: "不具合管理用フォルダに保存",
                },
                { value: "custom", label: "任意フォルダ", sub: "" },
              ] as { value: SaveDestination; label: string; sub: string }[]
            ).map(({ value, label, sub }) => (
              <label
                key={value}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 px-4 py-3 has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50"
              >
                <input
                  type="radio"
                  name="save-dest"
                  value={value}
                  checked={dest === value}
                  onChange={() => setDest(value)}
                  className="mt-0.5 accent-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    {label}
                  </div>
                  {sub && <div className="text-xs text-gray-400">{sub}</div>}
                  {value === "custom" && dest === "custom" && (
                    <input
                      type="text"
                      value={customDir}
                      onChange={(e) => setCustomDir(e.target.value)}
                      placeholder="D:\output\..."
                      className="mt-2 w-full rounded border border-gray-300 px-2 py-1.5 font-mono text-xs text-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* ファイル名 */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              ファイル名
            </label>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1.5 font-mono text-sm text-gray-700"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            disabled={!canSave}
            onClick={onClose}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// 共通コンポーネント
// ================================================================

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-300"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
      />
    </button>
  );
}
