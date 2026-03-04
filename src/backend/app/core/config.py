"""顧客プロファイル設定"""

from pydantic import BaseModel, Field

from app.schemas.collection import CollectionTarget


class CustomerProfile(BaseModel):
    archiver_path: str
    collection_targets: list[CollectionTarget] = Field(min_length=1)
