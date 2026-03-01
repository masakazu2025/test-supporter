"""採取 API エンドポイントのテスト"""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import CustomerProfile
from app.main import app
from app.schemas.collection import PoolStructure, SyncTargetType, WatchMode
from app.services.collection_monitor import CollectionMonitor, get_monitor


@pytest.fixture
def test_profile() -> CustomerProfile:
    return CustomerProfile(
        pool_root=Path("/tmp/test_pool"),
        pool_structure=PoolStructure.type_first,
        sync_targets=[
            {
                "type": SyncTargetType.entries,
                "remote_path": "/remote/entries",
                "local_name": "entries",
                "watch": WatchMode.realtime,
            }
        ],
    )


@pytest.fixture
def client(test_profile: CustomerProfile) -> TestClient:
    monitor = CollectionMonitor(profile=test_profile)
    app.dependency_overrides[get_monitor] = lambda: monitor
    yield TestClient(app)
    app.dependency_overrides.clear()


class TestCollectionStatus:
    def test_initial_status_is_empty(self, client: TestClient) -> None:
        """起動直後は監視セッションが存在しない"""
        response = client.get("/api/collection/status")
        assert response.status_code == 200
        assert response.json()["sessions"] == []


class TestCollectionStart:
    def test_start_returns_watching_status(self, client: TestClient) -> None:
        """start 後は watching ステータスが返る"""
        response = client.post(
            "/api/collection/start",
            json={"terminal": "192.168.1.10", "date": "2026-02-28"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["terminal"] == "192.168.1.10"
        assert data["date"] == "2026-02-28"
        assert data["status"] == "watching"

    def test_start_appears_in_status(self, client: TestClient) -> None:
        """start 後に status で監視セッションが確認できる"""
        client.post(
            "/api/collection/start",
            json={"terminal": "192.168.1.10", "date": "2026-02-28"},
        )
        response = client.get("/api/collection/status")
        sessions = response.json()["sessions"]
        assert len(sessions) == 1
        assert sessions[0]["terminal"] == "192.168.1.10"
        assert sessions[0]["status"] == "watching"

    def test_duplicate_start_returns_already_watching(self, client: TestClient) -> None:
        """同じ端末・日付で二重 start するとエラー"""
        client.post(
            "/api/collection/start",
            json={"terminal": "192.168.1.10", "date": "2026-02-28"},
        )
        response = client.post(
            "/api/collection/start",
            json={"terminal": "192.168.1.10", "date": "2026-02-28"},
        )
        assert response.status_code == 409


class TestCollectionStop:
    def test_stop_watched_session(self, client: TestClient) -> None:
        """監視中のセッションを停止できる"""
        client.post(
            "/api/collection/start",
            json={"terminal": "192.168.1.10", "date": "2026-02-28"},
        )
        response = client.post(
            "/api/collection/stop",
            json={"terminal": "192.168.1.10", "date": "2026-02-28"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "stopped"

    def test_stop_removes_from_status(self, client: TestClient) -> None:
        """stop 後は status から消える"""
        client.post(
            "/api/collection/start",
            json={"terminal": "192.168.1.10", "date": "2026-02-28"},
        )
        client.post(
            "/api/collection/stop",
            json={"terminal": "192.168.1.10", "date": "2026-02-28"},
        )
        response = client.get("/api/collection/status")
        assert response.json()["sessions"] == []

    def test_stop_not_watching_returns_404(self, client: TestClient) -> None:
        """監視していないセッションの stop は 404"""
        response = client.post(
            "/api/collection/stop",
            json={"terminal": "192.168.1.10", "date": "2026-02-28"},
        )
        assert response.status_code == 404


class TestCollectionSync:
    def test_sync_returns_synced_at(self, client: TestClient) -> None:
        """sync は synced_at を返す"""
        response = client.post(
            "/api/collection/sync",
            json={"terminal": "192.168.1.10", "date": "2026-02-28"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["terminal"] == "192.168.1.10"
        assert data["date"] == "2026-02-28"
        assert "synced_at" in data
