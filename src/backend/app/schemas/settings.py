"""設定機能のスキーマ定義"""

from pydantic import BaseModel


class TerminalInfo(BaseModel):
    id: str
    ip_address: str
    display_name: str | None = None


class ProfileSummary(BaseModel):
    id: str
    name: str


class ProfileDetail(BaseModel):
    id: str
    name: str
    archiver_path: str
    terminals: list[TerminalInfo]
