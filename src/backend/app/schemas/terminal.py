"""端末機能のスキーマ定義"""

from pydantic import BaseModel


class EntryRecord(BaseModel):
    entry_id: str
    filename: str
    captured_at: str  # "YYYY-MM-DD HH:MM:SS"
    in_pool: bool     # プールに採取済みか


class ScreenshotRecord(BaseModel):
    filename: str
    captured_at: str  # "YYYY-MM-DD HH:MM:SS"
    in_pool: bool


class TerminalManagementRecord(BaseModel):
    id: str
    ip_address: str
    display_name: str | None
    is_online: bool | None   # None = 確認中
    auto_collect: bool
    collect_date_mode: str   # "today" | "fixed"
    collect_date: str        # "YYYY-MM-DD"


class PoolStats(BaseModel):
    file_count: int
    total_bytes: int


class CleanupRequest(BaseModel):
    mode: str                      # "before" | "range" | "all"
    date_from: str | None = None   # "YYYY-MM-DD"
    date_to: str | None = None     # "YYYY-MM-DD"


class CleanupResult(BaseModel):
    deleted_count: int
    freed_bytes: int
