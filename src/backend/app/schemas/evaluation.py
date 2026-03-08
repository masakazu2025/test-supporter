"""評価機能のスキーマ定義"""

from pydantic import BaseModel


class Evidence(BaseModel):
    id: str
    filename: str
    source: str       # "pool" | "direct"
    added_at: str     # "YYYY-MM-DD HH:MM:SS"


class DefectRecord(BaseModel):
    id: str
    test_case_id: str | None  # nullable → 単独起票可
    test_case_ref: str | None # テストケースの spec_ref（表示用）
    title: str
    description: str


class TestCaseSummary(BaseModel):
    id: str
    spec_ref: str
    name: str | None
    evidence_count: int
    defect_count: int


class TestCaseDetail(BaseModel):
    id: str
    spec_ref: str
    name: str | None
    evidences: list[Evidence]
    defects: list[DefectRecord]
