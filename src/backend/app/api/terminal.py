"""端末 API エンドポイント（スケルトン）"""

from fastapi import APIRouter

from app.schemas.terminal import (
    CleanupRequest,
    CleanupResult,
    EntryRecord,
    PoolStats,
    ScreenshotRecord,
    TerminalManagementRecord,
)

router = APIRouter(prefix="/api/terminal", tags=["terminal"])

_MOCK_MANAGEMENT: list[TerminalManagementRecord] = [
    TerminalManagementRecord(
        id="t1",
        ip_address="192.168.1.10",
        display_name="SERVER-01",
        is_online=True,
        auto_collect=True,
        collect_date_mode="today",
        collect_date="2026-03-07",
    ),
    TerminalManagementRecord(
        id="t2",
        ip_address="192.168.1.11",
        display_name="SERVER-02",
        is_online=False,
        auto_collect=False,
        collect_date_mode="fixed",
        collect_date="2026-03-06",
    ),
    TerminalManagementRecord(
        id="t3",
        ip_address="192.168.1.12",
        display_name="SERVER-03",
        is_online=None,
        auto_collect=True,
        collect_date_mode="today",
        collect_date="2026-03-07",
    ),
]

_MOCK_ENTRIES: list[EntryRecord] = [
    EntryRecord(entry_id="001", filename="001.gz", captured_at="2024-03-15 09:30:05", in_pool=True),
    EntryRecord(entry_id="002", filename="002.gz", captured_at="2024-03-15 09:31:12", in_pool=True),
    EntryRecord(entry_id="003", filename="003.gz", captured_at="2024-03-15 09:32:44", in_pool=False),
    EntryRecord(entry_id="004", filename="004.gz", captured_at="2024-03-15 09:33:58", in_pool=False),
    EntryRecord(entry_id="005", filename="005.gz", captured_at="2024-03-15 09:35:01", in_pool=False),
]

_MOCK_SCREENSHOTS: list[ScreenshotRecord] = [
    ScreenshotRecord(filename="192168001010_20240315093005.png", captured_at="2024-03-15 09:30:05", in_pool=True),
    ScreenshotRecord(filename="192168001010_20240315093112.png", captured_at="2024-03-15 09:31:12", in_pool=True),
    ScreenshotRecord(filename="192168001010_20240315093244.png", captured_at="2024-03-15 09:32:44", in_pool=False),
]


# 管理系エンドポイント（/{id}/... より先に定義して競合を防ぐ）

@router.get("/management", response_model=list[TerminalManagementRecord])
async def list_management() -> list[TerminalManagementRecord]:
    return _MOCK_MANAGEMENT


@router.get("/{terminal_id}/pool-stats", response_model=PoolStats)
async def get_pool_stats(terminal_id: str) -> PoolStats:
    return PoolStats(file_count=12, total_bytes=4_404_019)


@router.post("/{terminal_id}/cleanup", response_model=CleanupResult)
async def cleanup_pool(terminal_id: str, body: CleanupRequest) -> CleanupResult:
    return CleanupResult(deleted_count=8, freed_bytes=2_936_012)


# 閲覧系エンドポイント

@router.get("/{ip}/entries", response_model=list[EntryRecord])
async def list_entries(ip: str) -> list[EntryRecord]:
    return _MOCK_ENTRIES


@router.get("/{ip}/screenshots", response_model=list[ScreenshotRecord])
async def list_screenshots(ip: str) -> list[ScreenshotRecord]:
    return _MOCK_SCREENSHOTS
