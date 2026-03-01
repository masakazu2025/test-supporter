"""採取監視サービス"""

from dataclasses import dataclass, field
from datetime import datetime, timezone

from app.core.config import CustomerProfile


@dataclass
class MonitorSession:
    terminal: str
    date: str
    status: str = "watching"
    started_at: datetime = field(default_factory=lambda: datetime.now(tz=timezone.utc))


class CollectionMonitor:
    def __init__(self, profile: CustomerProfile) -> None:
        self._profile = profile
        self._sessions: dict[tuple[str, str], MonitorSession] = {}

    def start(self, terminal: str, date: str) -> MonitorSession:
        """監視セッションを開始する。既に監視中の場合は ValueError を送出する"""
        key = (terminal, date)
        if key in self._sessions:
            raise ValueError(f"既に監視中: terminal={terminal}, date={date}")
        session = MonitorSession(terminal=terminal, date=date)
        self._sessions[key] = session
        return session

    def stop(self, terminal: str, date: str) -> MonitorSession:
        """監視セッションを停止する。監視中でない場合は KeyError を送出する"""
        key = (terminal, date)
        if key not in self._sessions:
            raise KeyError(f"監視中のセッションが見つからない: terminal={terminal}, date={date}")
        session = self._sessions.pop(key)
        session.status = "stopped"
        return session

    def get_sessions(self) -> list[MonitorSession]:
        """現在の監視セッション一覧を返す"""
        return list(self._sessions.values())

    def sync(self, terminal: str, date: str) -> datetime:
        """即時同期を実行する（スタブ）。同期完了時刻を返す"""
        # TODO: 実際の SSH 同期処理をここに実装する
        return datetime.now(tz=timezone.utc)


def get_monitor() -> CollectionMonitor:
    """FastAPI 依存性注入用のファクトリ関数（本番用）"""
    raise NotImplementedError("本番用モニターは app/main.py で上書きする")
