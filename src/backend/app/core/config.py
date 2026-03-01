"""顧客プロファイル設定"""

from pathlib import Path

from pydantic import BaseModel, Field

from app.schemas.collection import PoolStructure, SyncTarget


class CustomerProfile(BaseModel):
    pool_root: Path
    pool_structure: PoolStructure = PoolStructure.type_first
    sync_targets: list[SyncTarget] = Field(min_length=1)
