"""採取機能のスキーマ定義"""

from enum import StrEnum

from pydantic import BaseModel, Field, model_validator


class SyncTargetType(StrEnum):
    entries = "entries"
    screenshots = "screenshots"
    files = "files"
    # log_stream / log_snapshot は後回し


class WatchMode(StrEnum):
    realtime = "realtime"
    interval = "interval"


class PoolStructure(StrEnum):
    type_first = "type_first"
    terminal_first = "terminal_first"


class SyncTarget(BaseModel):
    type: SyncTargetType
    remote_path: str
    local_name: str
    watch: WatchMode
    interval_minutes: int | None = Field(default=None)

    @model_validator(mode="after")
    def validate_interval_minutes(self) -> "SyncTarget":
        if self.watch == WatchMode.interval and self.interval_minutes is None:
            raise ValueError("interval_minutes は watch=interval のとき必須です")
        return self
