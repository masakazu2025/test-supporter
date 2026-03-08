"""設定 API エンドポイント（スケルトン）"""

from fastapi import APIRouter, HTTPException

from app.schemas.settings import ProfileDetail, ProfileSummary, TerminalInfo

router = APIRouter(prefix="/api/settings", tags=["settings"])

_MOCK_PROFILES: list[ProfileDetail] = [
    ProfileDetail(
        id="1",
        name="案件A 1次試験",
        archiver_path="C:\\Tools\\myarchiver.exe",
        terminals=[
            TerminalInfo(id="t1", ip_address="192.168.1.10", display_name="端末A"),
            TerminalInfo(id="t2", ip_address="192.168.1.11", display_name="端末B"),
        ],
    ),
    ProfileDetail(
        id="2",
        name="案件B 総合テスト",
        archiver_path="C:\\Tools\\myarchiver.exe",
        terminals=[
            TerminalInfo(id="t3", ip_address="192.168.2.10", display_name="端末A"),
        ],
    ),
]


@router.get("/profiles", response_model=list[ProfileSummary])
async def list_profiles() -> list[ProfileSummary]:
    return [ProfileSummary(id=p.id, name=p.name) for p in _MOCK_PROFILES]


@router.get("/profiles/{profile_id}", response_model=ProfileDetail)
async def get_profile(profile_id: str) -> ProfileDetail:
    for p in _MOCK_PROFILES:
        if p.id == profile_id:
            return p
    raise HTTPException(status_code=404, detail="プロファイルが見つかりません")
