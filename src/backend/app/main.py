"""FastAPI アプリケーションのエントリポイント"""

import os
from pathlib import Path

from fastapi import FastAPI

from app.api.collection import router as collection_router
from app.core.config import CustomerProfile
from app.schemas.collection import PoolStructure, SyncTargetType, WatchMode
from app.services.collection_monitor import CollectionMonitor, get_monitor

app = FastAPI(title="Test Supporter API")

app.include_router(collection_router)

# 開発用デフォルトプロファイル（環境変数で上書き可能）
_default_profile = CustomerProfile(
    pool_root=Path(os.getenv("POOL_ROOT", "/tmp/test_supporter_pool")),
    pool_structure=PoolStructure(os.getenv("POOL_STRUCTURE", PoolStructure.type_first)),
    sync_targets=[
        {
            "type": SyncTargetType.entries,
            "remote_path": os.getenv("REMOTE_ENTRIES_PATH", "/remote/entries"),
            "local_name": "entries",
            "watch": WatchMode.realtime,
        }
    ],
)

_monitor = CollectionMonitor(profile=_default_profile)

app.dependency_overrides[get_monitor] = lambda: _monitor
