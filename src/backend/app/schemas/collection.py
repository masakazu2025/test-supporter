"""採取機能のスキーマ定義"""

from enum import StrEnum

from pydantic import BaseModel, Field, model_validator


class CollectionType(StrEnum):
    entries = "entries"
    screenshots = "screenshots"
    files = "files"


class WatchMode(StrEnum):
    realtime = "realtime"
    interval = "interval"


class ActionMode(StrEnum):
    copy = "copy"
    move = "move"


class FieldSource(StrEnum):
    filename = "filename"
    mtime = "mtime"
    terminal = "terminal"


class PostProcess(BaseModel):
    decompress: str | None = None


class FieldDef(BaseModel):
    name: str
    source: FieldSource
    regex: str | None = None
    group: int | None = None
    format: str | None = None

    @model_validator(mode="after")
    def validate_source_params(self) -> "FieldDef":
        if self.source == FieldSource.filename:
            if self.regex is None:
                raise ValueError("regex は source=filename のとき必須です")
            if self.group is None:
                raise ValueError("group は source=filename のとき必須です")
        elif self.source in (FieldSource.mtime, FieldSource.terminal):
            if self.format is None:
                raise ValueError(f"format は source={self.source} のとき必須です")
        return self


class CollectionTarget(BaseModel):
    type: CollectionType
    src_dir: str
    pattern: str
    dst_dir: str
    rename: str | None = None
    action: ActionMode = ActionMode.copy
    post_process: PostProcess | None = None
    watch: WatchMode | None = None
    interval_minutes: int | None = None
    schedule: str | None = None
    fields: list[FieldDef] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_watch_schedule(self) -> "CollectionTarget":
        if self.watch is not None and self.schedule is not None:
            raise ValueError("watch と schedule は排他です")
        if self.watch == WatchMode.interval and self.interval_minutes is None:
            raise ValueError("interval_minutes は watch=interval のとき必須です")
        return self
