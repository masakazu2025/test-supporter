"""評価 API エンドポイント（スケルトン）"""

from fastapi import APIRouter, HTTPException

from app.schemas.evaluation import (
    DefectRecord,
    Evidence,
    TestCaseDetail,
    TestCaseSummary,
)

router = APIRouter(prefix="/api/evaluation", tags=["evaluation"])

_MOCK_TESTCASES: list[TestCaseDetail] = [
    TestCaseDetail(
        id="1",
        spec_ref="1-001",
        name="ログイン正常系",
        evidences=[
            Evidence(id="e1", filename="001.gz", source="pool", added_at="2024-03-15 09:30:05"),
            Evidence(id="e2", filename="192168001010_20240315093005.png", source="pool", added_at="2024-03-15 09:30:05"),
        ],
        defects=[],
    ),
    TestCaseDetail(
        id="2",
        spec_ref="1-002",
        name="ログイン異常系（パスワード誤り）",
        evidences=[
            Evidence(id="e3", filename="002.gz", source="pool", added_at="2024-03-15 09:31:12"),
        ],
        defects=[
            DefectRecord(id="d1", test_case_id="2", test_case_ref="1-002", title="エラーメッセージが表示されない", description="パスワード誤り時にエラーメッセージが出ない"),
        ],
    ),
    TestCaseDetail(
        id="3",
        spec_ref="2-001",
        name="データ登録",
        evidences=[],
        defects=[],
    ),
]

_MOCK_DEFECTS: list[DefectRecord] = [
    DefectRecord(id="d1", test_case_id="2", test_case_ref="1-002", title="エラーメッセージが表示されない", description="パスワード誤り時にエラーメッセージが出ない"),
    DefectRecord(id="d2", test_case_id=None, test_case_ref=None, title="画面遷移が遅い", description="ログイン後の画面遷移に5秒以上かかる"),
]


@router.get("/testcases", response_model=list[TestCaseSummary])
async def list_testcases() -> list[TestCaseSummary]:
    return [
        TestCaseSummary(
            id=tc.id,
            spec_ref=tc.spec_ref,
            name=tc.name,
            evidence_count=len(tc.evidences),
            defect_count=len(tc.defects),
        )
        for tc in _MOCK_TESTCASES
    ]


@router.get("/testcases/{testcase_id}", response_model=TestCaseDetail)
async def get_testcase(testcase_id: str) -> TestCaseDetail:
    for tc in _MOCK_TESTCASES:
        if tc.id == testcase_id:
            return tc
    raise HTTPException(status_code=404, detail="テストケースが見つかりません")


@router.get("/defects", response_model=list[DefectRecord])
async def list_defects() -> list[DefectRecord]:
    return _MOCK_DEFECTS
